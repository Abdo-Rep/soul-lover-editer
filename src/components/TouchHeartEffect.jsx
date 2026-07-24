import { useEffect, useState } from 'react'
import { useContent } from '../context/ContentContext'

export default function TouchHeartEffect() {
  const { content } = useContent()
  const pushHeartChar = content?.appearance?.pushHeart || '♥'
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const colors = [
      'text-rose-400',
      'text-pink-400',
      'text-rose-500',
      'text-pink-500',
      'text-rose-600',
      'text-pink-600',
    ]

    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

    const handleMouseUp = (e) => {
      spawnParticles(e.clientX, e.clientY, getRandomColor())
    }

    const handleTouchEnd = (e) => {
      for (const touch of e.changedTouches) {
        spawnParticles(touch.clientX, touch.clientY, getRandomColor())
      }
    }

    // Event Listeners on release (mouseup / touchend)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const spawnParticles = (x, y, colorClass) => {
    const particleCount = 8 + Math.floor(Math.random() * 4) // 8 to 11 outer particles
    const newParticles = []
    const batchId = Math.random() + '-' + Date.now()

    // 1. Center heart/flower pop
    newParticles.push({
      id: `center-${batchId}`,
      isCenter: true,
      x,
      y,
      size: 32,
      colorClass,
    })

    // 2. Outer scattering particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2)
      const distance = 35 + Math.random() * 45
      const dx = Math.cos(angle) * distance
      const dy = Math.sin(angle) * distance
      const size = 12 + Math.random() * 10

      newParticles.push({
        id: `outer-${batchId}-${i}`,
        isCenter: false,
        x,
        y,
        dx,
        dy,
        size,
        colorClass,
      })
    }

    setParticles((prev) => [...prev, ...newParticles])
  }

  const removeParticle = (pid) => {
    setParticles((prev) => prev.filter((p) => p.id !== pid))
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 100000 }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute select-none ${p.colorClass}`}
          style={
            p.isCenter
              ? {
                  left: p.x,
                  top: p.y,
                  fontSize: `${p.size}px`,
                  animation: 'particleCenterPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  willChange: 'transform, opacity',
                  filter: 'drop-shadow(0 2px 8px rgba(251, 113, 133, 0.4))',
                }
              : {
                  left: p.x,
                  top: p.y,
                  fontSize: `${p.size}px`,
                  marginLeft: `-${p.size / 2}px`,
                  marginTop: `-${p.size / 2}px`,
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  animation: 'particleBurst 0.48s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  willChange: 'transform, opacity',
                }
          }
          onAnimationEnd={() => removeParticle(p.id)}
        >
          {pushHeartChar}
        </div>
      ))}
    </div>
  )
}
