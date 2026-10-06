import { useState } from 'react'
import SessionTimerBadge from '../../components/SessionTimerBadge.jsx'

export const FRAME_TEMPLATES = [
  { id: 'strip3', name: 'Strip 3 Foto', arrangement: 'strip', slotCount: 3 },
  { id: 'strip4', name: 'Strip 4 Foto', arrangement: 'strip', slotCount: 4 },
  { id: 'grid4', name: 'Grid 4 Foto', arrangement: 'grid', slotCount: 4 },
]

export default function FrameSelect({ photos, secondsLeft, onNext, onBack }) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [assignments, setAssignments] = useState(() =>
    Object.fromEntries(FRAME_TEMPLATES.map((t) => [t.id, Array(t.slotCount).fill(null)]))
  )
  const [activeSlot, setActiveSlot] = useState(0)

  const template = FRAME_TEMPLATES[frameIndex]
  const currentAssign = assignments[template.id]
  const isFull = currentAssign.every((v) => v !== null)

  function switchFrame(nextIndex) {
    const wrapped = (nextIndex + FRAME_TEMPLATES.length) % FRAME_TEMPLATES.length
    setFrameIndex(wrapped)
    const arr = assignments[FRAME_TEMPLATES[wrapped].id]
    const firstEmpty = arr.findIndex((v) => v === null)
    setActiveSlot(firstEmpty === -1 ? null : firstEmpty)
  }

  function handleSlotClick(slotIdx) {
    setActiveSlot(slotIdx)
  }

  function handlePhotoClick(photoIdx) {
    if (activeSlot === null) return
    setAssignments((prev) => {
      const arr = [...prev[template.id]]
      arr[activeSlot] = photoIdx
      const nextEmpty = arr.findIndex((v) => v === null)
      setActiveSlot(nextEmpty === -1 ? null : nextEmpty)
      return { ...prev, [template.id]: arr }
    })
  }

  const isGrid = template.arrangement === 'grid'

  return (
    <div className="stage-wide">
      <SessionTimerBadge secondsLeft={secondsLeft} />
      <button className="back-btn" onClick={onBack} aria-label="Kembali">←</button>

      <div style={{ flex: 1, display: 'flex', gap: 20, marginTop: 44, minHeight: 0 }}>
        {/* Kiri: label sticker (fitur segera hadir) */}
        <div
          style={{
            width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', fontSize: 11,
          }}
        >
          <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
            Stiker segera hadir ✦
          </span>
        </div>

        {/* Tengah: preview frame + panah + Next */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button className="btn btn-primary" disabled={!isFull} onClick={() => onNext(template, currentAssign)}>
              Next
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, minHeight: 0 }}>
            <button onClick={() => switchFrame(frameIndex - 1)} className="btn-ghost" style={arrowBtnStyle}>‹</button>

            <div className="polaroid" style={{ width: isGrid ? 260 : 190, maxHeight: '100%', overflowY: 'auto' }}>
              <div style={isGrid
                ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
                : { display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                {currentAssign.map((photoIdx, slotIdx) => (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    style={{
                      position: 'relative', aspectRatio: isGrid ? '1 / 1' : '3 / 4',
                      borderRadius: 4, overflow: 'hidden', background: 'rgba(36,27,46,0.08)',
                      display: 'flex', cursor: 'pointer',
                      border: activeSlot === slotIdx ? '3px solid var(--pink)' : '3px solid transparent',
                    }}
                  >
                    {photoIdx !== null ? (
                      <img src={photos[photoIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ margin: 'auto', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-soft)' }}>
                        {slotIdx + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => switchFrame(frameIndex + 1)} className="btn-ghost" style={arrowBtnStyle}>›</button>
          </div>

          <span className="ticket-label">{template.name}</span>
        </div>

        {/* Kanan: quick-select 3 frame */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 90 }}>
          {FRAME_TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => switchFrame(i)}
              style={{
                height: 90, borderRadius: 10, border: i === frameIndex ? '2px solid var(--amber)' : '2px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 10,
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bawah: 6 foto hasil jepretan */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
        {photos.map((src, i) => (
          <button
            key={i}
            onClick={() => handlePhotoClick(i)}
            disabled={activeSlot === null}
            style={{
              width: 64, height: 64, borderRadius: 8, overflow: 'hidden', padding: 0,
              border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0,
            }}
          >
            <img src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </div>
  )
}

const arrowBtnStyle = {
  fontSize: 32, width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1,
}
