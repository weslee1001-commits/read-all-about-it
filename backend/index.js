const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const prisma = new PrismaClient();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
});

function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

async function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next(); // allow anonymous
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).send('invalid auth');
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('invalid token');
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).send('admin required');
  next();
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/products/:id', (req, res) => {
  const product = {
    id: req.params.id,
    title: 'Demo Product',
    description: 'A demo product used for the scaffold',
    price: 29.99
  };
  res.json(product);
});

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).send('missing email or password');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).send('user exists');
  const hash = await bcrypt.hash(password, 10);
  // make first user admin
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? 'admin' : 'user';
  const user = await prisma.user.create({ data: { email, password: hash, name, role } });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('missing email or password');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).send('invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).send('invalid credentials');
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

app.get('/reviews', async (req, res) => {
  const productId = req.query.productId;
  const reviews = await prisma.review.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
  res.json(reviews);
});

app.post('/reviews', authenticateToken, async (req, res) => {
  const { productId, rating, content, isAIDraft } = req.body;
  if (!productId || !content) return res.status(400).send('missing fields');
  let authorId = null;
  let authorName = req.body.author || 'Anonymous';
  if (req.user && req.user.userId) {
    authorId = req.user.userId;
    const u = await prisma.user.findUnique({ where: { id: authorId } });
    authorName = u && u.name ? u.name : u.email;
  }
  const approved = isAIDraft ? false : true;
  const review = await prisma.review.create({ data: { productId, authorId, authorName, rating: rating || 5, content, approved } });
  io.emit(isAIDraft ? 'review:draft' : 'review:created', review);
  res.status(201).json(review);
});

app.post('/ai/generate', authenticateToken, async (req, res) => {
  const { productId, tone } = req.body;
  if (!productId) return res.status(400).send('missing productId');
  if (!openai) return res.status(500).send('OPENAI_API_KEY not configured');
  try {
    const system = { role: 'system', content: 'You are a helpful, concise product review writer.' };
    const userPrompt = `Write a concise, honest product review for product ID: ${productId}. Tone: ${tone || 'helpful'}. Include a short pros and cons list and a suggested star rating between 1 and 5. Keep it to ~3-5 sentences.`;
    const messages = [system, { role: 'user', content: userPrompt }];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300
    });
    const text = completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content ? completion.choices[0].message.content.trim() : '';
    const draft = await prisma.review.create({ data: { productId, authorName: 'AI (draft)', rating: 5, content: text, approved: false } });
    io.emit('review:draft', draft);
    res.json(draft);
  } catch (err) {
    console.error('AI generate error', err);
    res.status(500).send('AI generation failed');
  }
});

// Public AI status (shows whether OPENAI_API_KEY is configured)
app.get('/ai/status', (req, res) => {
  res.json({ configured: !!openai });
});

// Admin routes
app.get('/admin/reviews/pending', authenticateToken, requireAdmin, async (req, res) => {
  const pending = await prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: 'desc' } });
  res.json(pending);
});

app.post('/admin/reviews/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const review = await prisma.review.update({ where: { id }, data: { approved: true } });
  io.emit('review:approved', review);
  res.json(review);
});

// Affiliate redirect that logs and forwards
app.get('/affiliate/redirect', async (req, res) => {
  const { url, merchant, affiliateId } = req.query;
  if (!url) return res.status(400).send('missing url');
  await prisma.affiliateClick.create({ data: { merchant: merchant || 'unknown', affiliateId: affiliateId || null, url } });
  res.redirect(url);
});

server.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
