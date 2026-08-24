function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export function createLoveTransitionParticles(count) {
  return Array.from({ length: count }, (_, id) => {
    const angle = Math.random() * Math.PI * 2
    const distance = randomBetween(28, 118)

    return {
      id,
      type: 'heart',
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance,
      size: randomBetween(16, 46),
      opacity: randomBetween(0.72, 1),
      delay: randomBetween(0, 1.1),
      duration: randomBetween(1.7, 3.1),
      exitDelay: randomBetween(0, 0.9),
      rotation: randomBetween(-55, 55),
      spin: randomBetween(-140, 140),
    }
  })
}

export function getLoveTransitionParticleCount(config) {
  if (typeof window === 'undefined') {
    return config.animations.loveTransition.particleCount
  }

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (isReducedMotion) return 0

  const isMobile = window.matchMedia('(max-width: 640px)').matches
  const { particleCount, mobileParticleCount } = config.animations.loveTransition
  return isMobile ? mobileParticleCount : particleCount
}
