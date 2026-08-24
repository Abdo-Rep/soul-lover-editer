import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../data/config'

export default function WordByWord({
  text,
  wordDelay = config.animations.text.wordDelay,
  className = '',
}) {
  const words = text.split(/\s+/).filter(Boolean)
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    setVisibleCount(0)
    if (words.length === 0) return undefined

    const intervalId = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= words.length) {
          window.clearInterval(intervalId)
          return count
        }
        return count + 1
      })
    }, wordDelay)

    return () => window.clearInterval(intervalId)
  }, [text, wordDelay, words.length])

  return (
    <p className={`leading-loose ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={
            index < visibleCount
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: 10, filter: 'blur(4px)' }
          }
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="me-1.5 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}
