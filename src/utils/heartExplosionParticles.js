function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export function createRisingHearts(count) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: randomBetween(1, 99),
    size: randomBetween(14, 40),
    opacity: randomBetween(0.72, 1),
    delay: randomBetween(0, 1.4),
    duration: randomBetween(1.9, 3.4),
    travel: randomBetween(108, 128),
    drift: randomBetween(-18, 18),
    spin: randomBetween(-25, 25),
  }))
}

export function getRisingHeartCount(config) {
  if (typeof window === 'undefined') {
    return config.animations.heartExplosion.heartCount
  }

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (isReducedMotion) return 0

  const isMobile = window.matchMedia('(max-width: 640px)').matches
  const { heartCount, mobileHeartCount } = config.animations.heartExplosion
  return isMobile ? mobileHeartCount : heartCount
}
