import { useEffect, useRef, useState } from 'react'
import Countdown from '../../components/Countdown.jsx'
import SessionTimerBadge from '../../components/SessionTimerBadge.jsx'

const SHOT_COUNT = 6

export default function Capture({ secondsLeft, onDone }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('ready') // ready | counting | flash
  const [shots, setShots] = useState(Array(SHOT_COUNT).fill(null))
  const [activeIndex, setActiveIndex] = useState(0)
  const [retakeMode, setRetakeMode] = useState(false)
  const [pendingRetakeIndex, setPendingRetakeIndex] = useState(null)
  const [round, setRound] = useState(0)

  const allFilled = shots.every(Boolean)
  const someFilled = shots.some(Boolean)
  const canTapToShoot =
    phase === 'ready' && (!allFilled || (retakeMode && pendingRetakeIndex !== null))

  useEffect(() => {
    let stream
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', aspectRatio: { ideal: 16 / 10 } },
          audio: false,
        })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        setError('Kamera tidak bisa diakses. Izinkan akses kamera di browser lalu muat ulang halaman.')
      }
    }
    startCamera()
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  function takeShot() {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

    setPhase('flash')
    setTimeout(() => {
      setShots((prev) => {
        const next = [...prev]
        next[activeIndex] = dataUrl
        const nextEmpty = next.findIndex((s) => s === null)
        if (nextEmpty !== -1) setActiveIndex(nextEmpty)
        return next
      })
      setRetakeMode(false)
      setPendingRetakeIndex(null)
      setPhase('ready')
    }, 250)
  }

  function handleTap() {
    if (!canTapToShoot) return
    setPhase('counting')
    setRound((r) => r + 1)
  }

  function handleThumbnailClick(i) {
    if (!retakeMode || !shots[i]) return
    setActiveIndex(i)
    setPendingRetakeIndex(i)
  }

  const overlayText = (() => {
    if (phase !== 'ready') return null
    if (!allFilled) return `Ketuk dimana saja untuk potret (${shots.filter(Boolean).length}/${SHOT_COUNT})`
    if (retakeMode && pendingRetakeIndex === null) return 'Pilih foto yang mau diulang di bawah ↓'
    if (retakeMode && pendingRetakeIndex !== null) return 'Ketuk dimana saja untuk potret ulang'
    return null
  })()

  return (
    <div className="stage-wide">
      <SessionTimerBadge secondsLeft={secondsLeft} />

      <div
        onClick={handleTap}
        style={{
          position: 'relative', flex: 1, borderRadius: 16, overflow: 'hidden',
          background: '#000', border: '3px solid var(--curtain-light)',
          cursor: canTapToShoot ? 'pointer' : 'default', marginTop: 44,
        }}
      >
        {error ? (
          <div style={{ padding: 24, color: 'var(--pink)', fontSize: 14, textAlign: 'center' }}>{error}</div>
        ) : (
          <video
            ref={videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        )}

        {overlayText && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--paper)',
                background: 'rgba(21,14,36,0.55)', padding: '14px 28px', borderRadius: 999,
                textAlign: 'center', letterSpacing: '0.02em',
              }}
            >
              {overlayText}
            </span>
          </div>
        )}

        {phase === 'flash' && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff', animation: 'flash 0.25s ease-out' }} />
        )}
        {phase === 'counting' && <Countdown seed={round} seconds={3} onDone={takeShot} />}

        <style>{`@keyframes flash { 0% { opacity: 0.95; } 100% { opacity: 0; } }`}</style>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
        <button
          className="btn btn-ghost"
          disabled={!someFilled || phase !== 'ready'}
          onClick={() => setRetakeMode((v) => !v)}
          style={{ flexShrink: 0, background: retakeMode ? 'rgba(245,185,66,0.15)' : undefined }}
        >
          Retake
        </button>

        <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'center' }}>
          {shots.map((src, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              disabled={!retakeMode || !src}
              style={{
                width: 56, height: 56, borderRadius: 8, overflow: 'hidden', padding: 0,
                background: 'var(--paper)',
                border: pendingRetakeIndex === i ? '3px solid var(--amber)' : '2px solid transparent',
                flexShrink: 0,
              }}
            >
              {src ? (
                <img src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{i + 1}</span>
              )}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" disabled={!allFilled} onClick={() => onDone(shots)} style={{ flexShrink: 0 }}>
          Next
        </button>
      </div>
    </div>
  )
}
