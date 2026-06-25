import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const affiliateAmazonId = import.meta.env.VITE_AMAZON_ASSOCIATE_ID || ''
const affiliateWalmartId = import.meta.env.VITE_WALMART_ASSOCIATE_ID || ''

const socket = io(API)

export default function App() {
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [aiConfigured, setAiConfigured] = useState(null)

  useEffect(() => {
    fetch(`${API}/products/demo`)
      .then(r => r.json())
      .then(setProduct)

    fetch(`${API}/reviews?productId=demo`)
      .then(r => r.json())
      .then(setReviews)

    socket.on('review:created', (rev) => {
      if (rev.productId === 'demo') setReviews(r => [rev, ...r])
    })

    socket.on('review:draft', (rev) => {
      if (rev.productId === 'demo') setReviews(r => [rev, ...r])
    })

    // fetch AI status
    fetch(`${API}/ai/status`).then(r => r.json()).then(d => setAiConfigured(!!d.configured)).catch(() => setAiConfigured(false));

    return () => socket.off();
  }, [])

  const submit = async () => {
    const res = await fetch(`${API}/reviews`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'demo', author: 'WebUser', rating, content, approved: true })
    })
    const data = await res.json()
    setContent('')
  }

  const generateAI = async () => {
    await fetch(`${API}/ai/generate`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ productId: 'demo', tone: 'helpful' }) })
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h1>Read All About It</h1>
          <div className="ai-badge">AI: {aiConfigured === null ? '...' : aiConfigured ? 'On' : 'Off'}</div>
        </div>
      </header>
      <main>
        {product && (
          <section className="product">
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <div className="price">${product.price}</div>
            <a className="buy" href={`${API}/affiliate/redirect?url=https://www.amazon.com&merchant=amazon&affiliateId=${affiliateAmazonId}`} target="_blank" rel="noreferrer">Buy on Amazon</a>
            <a className="buy" style={{marginLeft:8}} href={`${API}/affiliate/redirect?url=https://www.walmart.com&merchant=walmart&affiliateId=${affiliateWalmartId}`} target="_blank" rel="noreferrer">Buy on Walmart</a>
          </section>
        )}

        <section className="write">
          <h3>Write a review</h3>
          <div>
            <label>Rating:</label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
            </select>
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your experience"></textarea>
          <div className="actions">
            <button onClick={submit} className="primary">Post review</button>
            <button onClick={generateAI} className="secondary">Generate AI draft</button>
          </div>
        </section>

        <section className="reviews">
          <h3>Reviews</h3>
          {reviews.map(r => (
            <article key={r.id} className={`review ${r.approved? 'approved': 'draft'}`}>
              <div className="meta"><strong>{r.author}</strong> · {new Date(r.createdAt).toLocaleString()}</div>
              <div className="rating">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
              <p>{r.content}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
