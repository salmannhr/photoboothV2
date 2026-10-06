export default function SessionTimerBadge({ secondsLeft }) {
  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const low = secondsLeft <= 60

  return (
    <div
      style={{
        position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
        color: low ? 'var(--pink)' : 'var(--amber-soft)',
        background: 'rgba(0,0,0,0.35)', padding: '6px 14px', borderRadius: 999,
        letterSpacing: '0.05em', zIndex: 5,
      }}
    >
      ⏱ {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  )
}
