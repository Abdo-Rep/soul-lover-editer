import { config } from '../data/config'

function readThemeVar(name, fallback) {
  if (typeof document === 'undefined') return fallback

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!value) return fallback
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function readThemeRgb() {
  if (typeof document === 'undefined') return config.hearts.rgb

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--theme-rgb')
    .trim()

  return value || config.hearts.rgb
}

function readBackgroundHeartRgb() {
  if (typeof document === 'undefined') return config.hearts.rgb

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--background-heart-rgb')
    .trim()

  return value || readThemeRgb()
}

export function getHeartOpacityBounds() {
  return {
    opacityMin: readThemeVar('--heart-opacity-min', config.hearts.opacityMin),
    opacityMax: readThemeVar('--heart-opacity-max', config.hearts.opacityMax),
  }
}

export function pickHeartSize() {
  const roll = Math.random()
  if (roll < 0.08) return 64 + Math.random() * 56
  if (roll < 0.2) return 40 + Math.random() * 28
  if (roll < 0.45) return 22 + Math.random() * 20
  return 12 + Math.random() * 14
}

export function pickHeartOpacity() {
  const { opacityMin, opacityMax } = getHeartOpacityBounds()
  return opacityMin + Math.random() * (opacityMax - opacityMin)
}

export function heartColor(opacity) {
  return `rgba(${readBackgroundHeartRgb()}, ${opacity})`
}

export function heartGlowShadow() {
  return `0 0 12px rgba(${readBackgroundHeartRgb()}, 0.35)`
}

export function createFloatingHearts(count) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: `${1 + Math.random() * 98}%`,
    size: pickHeartSize(),
    opacityRatio: Math.random(),
    delay: Math.random() * 10,
    duration: 9 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 70,
  }))
}

export function resolveHeartOpacity(opacityRatio) {
  const { opacityMin, opacityMax } = getHeartOpacityBounds()
  return opacityMin + opacityRatio * (opacityMax - opacityMin)
}

export function getHeartCount() {
  if (typeof window === 'undefined') return config.hearts.count

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (isReducedMotion) return 0

  const isMobile = window.matchMedia('(max-width: 640px)').matches
  return isMobile
    ? Math.round(config.hearts.count * config.hearts.mobileRatio)
    : config.hearts.count
}
