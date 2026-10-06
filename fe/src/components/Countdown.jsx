import { useEffect, useState } from 'react'

export default function Countdown({ seconds = 3, seed, onDone }) {
  const [n, setN] = useState(seconds)

  useEffect(() => { setN(seconds) }, [seed, seconds])

  useEffect(() => {
    if (n <= 0) { onDone(); return }
    const t = setTimeout(() => setN((v) => v - 1), 800)
    return () => clearTimeout(t)
  }, [n, onDone])

  return (
    <div
      key={n}
      style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', pointerEvents: 'none', zIndex: 10,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)', fontSize: 140, color: 'var(--amber-soft)',
          textShadow: '0 0 30px rgba(245,185,66,0.8)', animation: 'pop 0.8s ease-out',
        }}
      >
        {n > 0 ? n : '📸'}
      </span>
      <style>{`@keyframes pop { 0% { transform: scale(0.4); opacity: 0; } 30% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 0.9; } }`}</style>
    </div>
  )
}
