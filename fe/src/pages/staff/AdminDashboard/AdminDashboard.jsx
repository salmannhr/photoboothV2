import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function AdminDashboard({ token, onLogout }) {
  const [codes, setCodes] = useState([])
  const [newCode, setNewCode] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  async function refreshCodes() {
    try {
      const res = await fetch(`${API_URL}/api/codes`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setCodes(await res.json())
    } catch {}
  }

  useEffect(() => { refreshCodes() }, [])

  const usedCount = codes.filter((c) => c.status === 'used').length

  async function handleGenerate() {
    setErrorMsg(null)
    try {
      const res = await fetch(`${API_URL}/api/codes`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Gagal generate kode.')
      const data = await res.json()
      setNewCode(data.code)
      refreshCodes()
    } catch (e) {
      setErrorMsg(e.message)
    }
  }

  return (
    <div className="stage-card" style={{ justifyContent: 'center', gap: 20, position: 'relative' }}>
      <button className="back-btn" onClick={onLogout} aria-label="Keluar">←</button>

      <div style={{ textAlign: 'center' }}>
        <span className="ticket-label">admin</span>
        <h2 className="marquee" style={{ margin: '6px 0 0', fontSize: 26 }}>GENERATE KODE</h2>
      </div>

      <div className="receipt" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          Count: kode yang sudah dipakai bersama email
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, margin: '8px 0' }}>
          {String(usedCount).padStart(3, '0')}
        </div>
      </div>

      {newCode && (
        <div className="receipt" style={{ textAlign: 'center', border: '2px dashed var(--pink)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>Kode buat customer (tunjukkan layar ini)</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '0.15em' }}>{newCode}</div>
        </div>
      )}

      {errorMsg && <span style={{ fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>{errorMsg}</span>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate}>Generate</button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setNewCode(null)}>Reset</button>
      </div>
    </div>
  )
}
