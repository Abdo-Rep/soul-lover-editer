import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '../data/config'
import {
  createLoveTransitionParticles,
  getLoveTransitionParticleCount,
} from '../utils/loveTransitionParticles'
import { useContent } from '../context/ContentContext'

const { loveTransition } = config.animations
const EXPAND_EASE = [0.16, 1, 0.3, 1]
const REVEAL_EASE = [0.33, 0, 0.2, 1]

function TransitionParticle({ particle, phase, revealDuration, heartSymbol }) {
  const isRevealing = phase === 'reveal'

  return (
    <motion.span
      className="love-transition__particle love-transition__particle--heart"
      style={{
        left: '50%',
        top: '50%',
        fontSize: `${particle.size}px`,
      }}
      initial={{
        x: '-50%',
        y: '-50%',
        scale: 0.15,
        opacity: 0,
        rotate: particle.rotation,
      }}
      animate={
        isRevealing
          ? {
              x: `calc(-50% + ${particle.targetX}vmin)`,
              y: `calc(-50% + ${particle.targetY}vmin)`,
              scale: 0.82,
              opacity: 0,
              rotate: particle.rotation + particle.spin * 0.35,
            }
          : {
              x: `calc(-50% + ${particle.targetX}vmin)`,
              y: `calc(-50% + ${particle.targetY}vmin)`,
              scale: 1,
              opacity: particle.opacity,
              rotate: particle.rotation,
            }
      }
      transition={
        isRevealing
          ? {
              duration: revealDuration,
              delay: particle.exitDelay,
              ease: REVEAL_EASE,
            }
          : {
              duration: particle.duration,
              delay: particle.delay,
              ease: EXPAND_EASE,
            }
      }
    >
      {heartSymbol}
    </motion.span>
  )
}

export default function LoveTransition({ onCovered, onComplete, canExit }) {
  const { content } = useContent()
  const pushHeart = content.appearance?.pushHeart || '♥'
  const [phase, setPhase] = useState('expand')
  const onCoveredRef = useRef(onCovered)
  const onCompleteRef = useRef(onComplete)
  const coveredRef = useRef(false)
  const finishedRef = useRef(false)

  const particles = useMemo(
    () => createLoveTransitionParticles(getLoveTransitionParticleCount(config)),
    [],
  )

  onCoveredRef.current = onCovered
  onCompleteRef.current = onComplete

  const markCovered = () => {
    if (coveredRef.current) return
    coveredRef.current = true
    onCoveredRef.current?.()
  }

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    onCompleteRef.current?.()
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      markCovered()
      finish()
      return undefined
    }

    const coverTimer = window.setTimeout(() => {
      setPhase('covered')
      markCovered()
    }, loveTransition.expandDuration * 1000)

    const failsafeTimer = window.setTimeout(
      finish,
      (loveTransition.expandDuration + loveTransition.revealDuration) * 1000 + 4500,
    )

    return () => {
      window.clearTimeout(coverTimer)
      window.clearTimeout(failsafeTimer)
    }
  }, [])

  useEffect(() => {
    if (phase === 'covered' && canExit) {
      setPhase('reveal')
    }
  }, [phase, canExit])

  const handleRevealComplete = () => {
    if (phase === 'reveal') finish()
  }

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key="love-transition"
        className="love-transition"
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'reveal' ? 0 : 1 }}
        transition={{
          duration: loveTransition.revealDuration,
          ease: REVEAL_EASE,
        }}
        onAnimationComplete={handleRevealComplete}
      >
        <motion.div
          className="love-transition__bloom"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={
            phase === 'reveal'
              ? { scale: 2.8, opacity: 0 }
              : { scale: 2.6, opacity: 0.88 }
          }
          transition={{
            duration:
              phase === 'reveal'
                ? loveTransition.revealDuration
                : loveTransition.expandDuration,
            ease: phase === 'reveal' ? REVEAL_EASE : EXPAND_EASE,
          }}
        />

        <motion.div
          className="love-transition__veil"
          initial={{ opacity: 0 }}
          animate={
            phase === 'reveal'
              ? { opacity: 0 }
              : phase === 'covered'
                ? { opacity: 1 }
                : { opacity: 0.35 }
          }
          transition={{
            duration: phase === 'reveal' ? loveTransition.revealDuration : 1.1,
            ease: REVEAL_EASE,
          }}
        />

        <div className="love-transition__particles">
          {particles.map((particle) => (
            <TransitionParticle
              key={particle.id}
              particle={particle}
              phase={phase}
              revealDuration={loveTransition.revealDuration}
              heartSymbol={pushHeart}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
