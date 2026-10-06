import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function OperatorDashboard({ token, onLogout }) {
  const [codes, setCodes] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/codes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then(setCodes)
      .catch(() => {})
  }, [])

  return (
    <div className="stage-card" style={{ gap: 16, position: 'relative', paddingTop: 60 }}>
      <button className="back-btn" onClick={onLogout} aria-label="Keluar">←</button>

      <div style={{ textAlign: 'center' }}>
        <span className="ticket-label">operator</span>
        <h2 className="marquee" style={{ margin: '6px 0 0', fontSize: 24 }}>RIWAYAT KODE</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {codes.length === 0 && (
          <span style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13 }}>Belum ada kode.</span>
        )}
        {codes.map((c) => (
          <div key={c.code} className="receipt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{c.code}</div>
              {c.used_email && <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{c.used_email}</div>}
            </div>
            <span
              style={{
                fontSize: 10, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999,
                background: c.status === 'used' ? 'rgba(107,95,122,0.15)' : 'rgba(255,77,141,0.15)',
                color: c.status === 'used' ? 'var(--ink-soft)' : 'var(--pink)',
              }}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
