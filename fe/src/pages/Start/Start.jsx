export default function Start({ onStart, onOpenStaff }) {
  return (
    <div
      onClick={onStart}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', gap: 26, textAlign: 'center', cursor: 'pointer',
      }}
    >
      <button
        className="corner-icon-btn"
        onClick={(e) => { e.stopPropagation(); onOpenStaff() }}
        aria-label="Menu staff"
        title="Menu staff"
      >
        ⚙
      </button>

      <div>
        <div className="ticket-label" style={{ marginBottom: 10 }}>photobooth digital</div>
        <h1 className="marquee" style={{ fontSize: 58, lineHeight: 0.95, margin: 0 }}>
          SNAP<br />STRIP
        </h1>
      </div>

      <p style={{ color: 'rgba(250,246,236,0.75)', fontSize: 15, lineHeight: 1.6, maxWidth: 320 }}>
        Selamat datang di photobooth digital! Silakan sentuh layar untuk memulai sesi foto.
      </p>

      <div
        style={{
          marginTop: 8, padding: '14px 30px', borderRadius: 999,
          border: '2px solid rgba(245,185,66,0.5)', color: 'var(--amber-soft)',
          fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em',
          animation: 'pulse 1.8s ease-in-out infinite',
        }}
      >
        SENTUH LAYAR UNTUK MULAI
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  )
}
