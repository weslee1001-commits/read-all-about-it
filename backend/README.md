# Backend (Express)

Quick start:

1. Copy environment example:

```bash
cp .env.example .env
```

2. Install dependencies and start dev server:

```bash
cd backend
npm install
npm run dev
```

Endpoints:
- `GET /health` — healthcheck
- `GET /products/:id` — demo product
- `GET /reviews?productId=...` — list reviews for product
- `POST /reviews` — create review (body: {productId, author, rating, content, approved})
- `POST /ai/generate` — generate AI draft (stub)
 - `POST /ai/generate` — generate AI draft (uses OpenAI when `OPENAI_API_KEY` is set)
- `GET /affiliate/redirect?url=...&merchant=...&affiliateId=...` — logs then redirects

Socket.IO is used for realtime review events.

AI configuration:
- Set `OPENAI_API_KEY` in your `.env` (or in deployment environment variables) to enable AI draft generation.
- The endpoint `POST /ai/generate` requires a JSON body `{ "productId": "...", "tone": "helpful" }` and returns the saved draft review (approved=false).
