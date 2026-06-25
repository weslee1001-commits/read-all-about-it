import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function downloadCSV(rows, filename='pending_reviews.csv'){
  const csv = rows.map(r => [r.id, r.productId, r.authorName, r.rating, JSON.stringify(r.content), r.createdAt].join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
}

function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) fetchPending()
  }, [token])

  async function fetchPending(){
    setLoading(true)
    try{
      const res = await fetch(`${API}/admin/reviews/pending`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('auth or fetch failed')
      const js = await res.json()
      setPending(js)
    }catch(e){
      alert('Failed to fetch pending drafts. Check token.')
    }finally{setLoading(false)}
  }

  async function approve(id){
    try{
      const res = await fetch(`${API}/admin/reviews/${id}/approve`, { method:'POST', headers:{ Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('approve failed')
      await fetchPending()
    }catch(e){ alert('Approve failed') }
  }

  return (
    <div style={{maxWidth:900,margin:'1rem auto',padding:16}}>
      <h1>Admin — Pending Drafts</h1>
      <div style={{marginBottom:12}}>
        <label style={{marginRight:8}}>Admin token:</label>
        <input style={{width:'60%'}} value={token} onChange={e=>setToken(e.target.value)} />
        <button onClick={()=>{localStorage.setItem('admin_token', token); fetchPending()}} style={{marginLeft:8}}>Save & Refresh</button>
      </div>
      <div style={{marginBottom:12}}>
        <button onClick={fetchPending} disabled={loading}>Refresh</button>
        <button onClick={()=>downloadCSV(pending)} style={{marginLeft:8}}>Export CSV</button>
      </div>
      <div>
        {pending.length===0 ? <p>No pending drafts.</p> : pending.map(r => (
          <div key={r.id} style={{border:'1px solid #eee',padding:12,marginBottom:8}}>
            <div><strong>{r.authorName}</strong> · {new Date(r.createdAt).toLocaleString()}</div>
            <div style={{color:'#ff9900'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
            <p>{r.content}</p>
            <div>
              <button onClick={()=>approve(r.id)}>Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('admin-root')).render(<Admin />)
