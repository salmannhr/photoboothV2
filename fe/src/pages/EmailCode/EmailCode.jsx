import { useState } from 'react'

export default function EmailCode({ onVerified, onBack }) {
  const [email, setEmail] = useState('')

  function handleSubmit() {
    onVerified(email || 'test@example.com')
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 22,
        position: 'relative',
      }}
    >
      <button className="back-btn" onClick={onBack} aria-label="Kembali">
        ←
      </button>

      <div style={{ textAlign: 'center' }}>
        <h1 className="marquee" style={{ fontSize: 36, margin: 0 }}>
          STRIPHOTO
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          className="field-input"
          type="email"
          placeholder="Email kamu (opsional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div
          style={{
            fontSize: 12,
            color: 'var(--pink)',
            textAlign: 'center',
          }}
        >
          Mode testing: verifikasi email dan kode kasir dilewati.
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSubmit}>
        Lanjut
      </button>
    </div>
  )
}