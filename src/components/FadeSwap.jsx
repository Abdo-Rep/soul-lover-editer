import { useEffect, useRef, useState } from 'react'
import { getScreenMotion } from '../utils/motion'

const INSTANT_ENTER_KEYS = new Set([])

export default function FadeSwap({
  activeKey,
  children,
  className = '',
  instantEnter = false,
}) {
  const [displayKey, setDisplayKey] = useState(activeKey)
  const [anim, setAnim] = useState('in')
  const pendingKey = useRef(null)
  const screen = getScreenMotion()

  const shouldInstantEnter = (key) =>
    instantEnter || INSTANT_ENTER_KEYS.has(key)

  useEffect(() => {
    if (activeKey === displayKey) return

    pendingKey.current = activeKey
    setAnim('out')
  }, [activeKey, displayKey])

  const handleAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return
    if (anim !== 'out') return

    const nextKey = pendingKey.current ?? activeKey
    pendingKey.current = null
    setDisplayKey(nextKey)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    setAnim(shouldInstantEnter(nextKey) ? 'instant' : 'in')
  }

  const animClass =
    anim === 'out'
      ? 'screen-fade-out'
      : anim === 'instant'
        ? 'screen-fade-instant'
        : 'screen-fade-in'

  return (
    <div
      className={`${animClass} ${className}`}
      onAnimationEnd={handleAnimationEnd}
      style={{
        '--screen-y': `${screen.y}px`,
        '--screen-fade-out': `${screen.fadeOut}ms`,
        '--screen-fade-in': `${screen.fadeIn}ms`,
      }}
    >
      {children(displayKey)}
    </div>
  )
}
