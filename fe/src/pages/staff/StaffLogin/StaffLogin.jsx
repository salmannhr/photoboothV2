import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function StaffLogin({ intendedRole, onLoggedIn, onBack }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('form') // form | loading
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleSubmit() {
    if (!username || !password) return
    setErrorMsg(null)
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Login gagal.')
      }
      const data = await res.json()
      onLoggedIn(data) // { token, role, username }
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('form')
    }
  }

  return (
    <div className="stage-card" style={{ justifyContent: 'center', gap: 20, position: 'relative' }}>
      <button className="back-btn" onClick={onBack} aria-label="Kembali">←</button>

      <div style={{ textAlign: 'center' }}>
        <span className="ticket-label">login {intendedRole}</span>
        <h2 className="marquee" style={{ margin: '6px 0 0', fontSize: 26 }}>WELCOME</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="field-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="field-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errorMsg && <span style={{ fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>{errorMsg}</span>}
      </div>

      <button className="btn btn-primary" disabled={status === 'loading'} onClick={handleSubmit}>
        {status === 'loading' ? 'Masuk…' : 'Masuk'}
      </button>
    </div>
  )
}
