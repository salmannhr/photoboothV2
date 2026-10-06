import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function EmailCode({ onVerified, onBack }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState('form') // form | checking
  const [errorMsg, setErrorMsg] = useState(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const codeValid = code.trim().length > 0

  async function handleSubmit() {
    if (!emailValid || !codeValid) {
      setTouched(true)
      return
    }
    setErrorMsg(null)
    setStatus('checking')

    try {
      const res = await fetch(`${API_URL}/api/codes/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Kode tidak valid.')
      }
      onVerified(email)
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('form')
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, position: 'relative' }}>
      <button className="back-btn" onClick={onBack} aria-label="Kembali">←</button>

      <div style={{ textAlign: 'center' }}>
        <h1 className="marquee" style={{ fontSize: 36, margin: 0 }}>STRIPHOTO</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          className="field-input"
          type="email"
          placeholder="Email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
        />
        <input
          className="field-input"
          type="text"
          inputMode="numeric"
          placeholder="Kode dari kasir"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onBlur={() => setTouched(true)}
          style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 22, letterSpacing: '0.3em' }}
        />
        {touched && (!emailValid || !codeValid) && (
          <span style={{ fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>
            Isi email yang valid dan kode dari kasir ya.
          </span>
        )}
        {errorMsg && <span style={{ fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>{errorMsg}</span>}
      </div>

      <button className="btn btn-primary" disabled={status === 'checking'} onClick={handleSubmit}>
        {status === 'checking' ? 'Memeriksa…' : 'Lanjut'}
      </button>
    </div>
  )
}
