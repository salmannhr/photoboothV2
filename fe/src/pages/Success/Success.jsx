export default function Success({ email, onRestart }) {
  return (
    <div className="stage-card" style={{ justifyContent: 'center', alignItems: 'center', gap: 22, textAlign: 'center' }}>
      <span style={{ fontSize: 52 }}>🖨️</span>
      <div>
        <span className="ticket-label">sesi selesai</span>
        <h2 className="marquee" style={{ margin: '6px 0 0', fontSize: 30 }}>SEDANG DICETAK!</h2>
      </div>
      <p style={{ color: 'rgba(250,246,236,0.75)', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
        Foto kamu sedang dicetak, dan semua hasil jepretan + hasil edit kamu sudah dikirim ke{' '}
        <strong style={{ color: 'var(--amber-soft)' }}>{email}</strong>.
      </p>
      <button className="btn btn-primary" onClick={onRestart}>Sesi Baru</button>
    </div>
  )
}
