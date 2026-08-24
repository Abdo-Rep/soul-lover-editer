import { useEffect, useMemo, useRef, useState } from 'react'
import { useContent } from '../context/ContentContext'
import {
  createFloatingHearts,
  getHeartCount,
  heartColor,
  resolveHeartOpacity,
} from '../utils/heartVisuals'

function HeartBackground({ className = '' }) {
  const { content } = useContent()
  const heartsCache = useRef({ count: 0, hearts: [] })
  const [count, setCount] = useState(() => getHeartCount())

  useEffect(() => {
    const update = () => setCount(getHeartCount())
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileQuery = window.matchMedia('(max-width: 640px)')

    motionQuery.addEventListener('change', update)
    mobileQuery.addEventListener('change', update)
    update()

    return () => {
      motionQuery.removeEventListener('change', update)
      mobileQuery.removeEventListener('change', update)
    }
  }, [])

  const hearts = useMemo(() => {
    if (count <= 0) {
      heartsCache.current = { count: 0, hearts: [] }
      return []
    }

    if (
      heartsCache.current.count === count &&
      heartsCache.current.hearts.length > 0
    ) {
      return heartsCache.current.hearts
    }

    const created = createFloatingHearts(count)
    heartsCache.current = { count, hearts: created }
    return created
  }, [count])

  if (hearts.length === 0) return null

  return (
    <div
      className={`heart-background pointer-events-none fixed inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {hearts.map((heart) => {
        const opacity = resolveHeartOpacity(heart.opacityRatio)

        return (
          <span
            key={heart.id}
            className="heart-background__item absolute select-none"
            style={{
              left: heart.left,
              fontSize: `${heart.size}px`,
              color: heartColor(opacity),
              '--heart-opacity': opacity,
              '--heart-duration': `${heart.duration}s`,
              '--heart-delay': `${heart.delay}s`,
              '--heart-drift': `${heart.drift}px`,
            }}
          >
            {content.appearance?.backgroundHeart ?? '♥'}
          </span>
        )
      })}
    </div>
  )
}

export default HeartBackground
