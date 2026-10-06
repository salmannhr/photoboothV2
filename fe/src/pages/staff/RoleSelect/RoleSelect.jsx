export default function RoleSelect({ onSelect, onBack }) {
  return (
    <div className="stage-card" style={{ justifyContent: 'center', gap: 26, position: 'relative' }}>
      <button className="back-btn" onClick={onBack} aria-label="Kembali">←</button>

      <div style={{ textAlign: 'center' }}>
        <span className="ticket-label">mode staff</span>
        <h2 className="marquee" style={{ margin: '6px 0 0', fontSize: 28 }}>PILIH ROLE</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
        <RoleButton icon="🛠️" label="Admin" onClick={() => onSelect('admin')} />
        <span style={{ color: 'var(--ink-soft)', fontSize: 24 }}>/</span>
        <RoleButton icon="🧑" label="Operator" onClick={() => onSelect('operator')} />
      </div>
    </div>
  )
}

function RoleButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 130, height: 130, borderRadius: 16, border: '2px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--paper)',
      }}
    >
      <span style={{ fontSize: 34 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.02em' }}>{label}</span>
    </button>
  )
}
