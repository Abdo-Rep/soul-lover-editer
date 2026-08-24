import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { config } from '../data/config'
import {
  createRisingHearts,
  getRisingHeartCount,
} from '../utils/heartExplosionParticles'
import { useContent } from '../context/ContentContext'

const { heartExplosion } = config.animations

function RisingHeart({ particle, heartSymbol }) {
  return (
    <span
      className="heart-explosion__heart heart-explosion__heart--rise pointer-events-none absolute select-none"
      style={{
        left: `${particle.left}%`,
        fontSize: `${particle.size}px`,
        '--rise-delay': `${particle.delay}s`,
        '--rise-duration': `${particle.duration}s`,
        '--rise-travel': `${particle.travel}vh`,
        '--rise-drift': `${particle.drift}px`,
        '--rise-opacity': particle.opacity,
      }}
    >
      {heartSymbol}
    </span>
  )
}

export default function HeartExplosionTransition({ onSwap, onComplete }) {
  const { content } = useContent()
  const pushHeart = content.appearance?.pushHeart ?? '♥'
  const onSwapRef = useRef(onSwap)
  const onCompleteRef = useRef(onComplete)
  const swappedRef = useRef(false)
  const finishedRef = useRef(false)

  const particles = useMemo(
    () => createRisingHearts(getRisingHeartCount(config)),
    [],
  )

  onSwapRef.current = onSwap
  onCompleteRef.current = onComplete

  useEffect(() => {
    swappedRef.current = false
    finishedRef.current = false

    const swapDelay = heartExplosion.duration * heartExplosion.swapRatio
    const swapTimer = window.setTimeout(() => {
      if (swappedRef.current) return
      swappedRef.current = true
      onSwapRef.current?.()
    }, swapDelay)

    const completeTimer = window.setTimeout(() => {
      if (finishedRef.current) return
      finishedRef.current = true
      onCompleteRef.current?.()
    }, heartExplosion.duration)

    return () => {
      window.clearTimeout(swapTimer)
      window.clearTimeout(completeTimer)
    }
  }, [])

  return createPortal(
    <div
      className="heart-explosion"
      style={{ '--explosion-duration': `${heartExplosion.duration}ms` }}
      aria-hidden="true"
    >
      <div className="heart-explosion__stage">
        {particles.map((particle) => (
          <RisingHeart key={particle.id} particle={particle} heartSymbol={pushHeart} />
        ))}
      </div>

      <div className="heart-explosion__veil pointer-events-none absolute inset-0" />
    </div>,
    document.body,
  )
}
