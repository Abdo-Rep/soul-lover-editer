import { config } from '../data/config'

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function getScreenMotion() {
  const { screen } = config.animations
  const reduced = prefersReducedMotion()

  return {
    fadeOut: reduced ? 200 : screen.fadeOut,
    fadeIn: reduced ? 300 : screen.fadeIn,
    y: reduced ? 0 : screen.y,
    easeOut: screen.easeOut,
    easeIn: screen.easeIn,
  }
}

export function getRevealMotion() {
  const { reveal } = config.animations
  const reduced = prefersReducedMotion()

  return {
    stagger: reduced ? 0 : reveal.stagger / 1000,
    duration: reduced ? 0.2 : reveal.duration / 1000,
    y: reduced ? 0 : reveal.y,
    ease: reveal.ease,
  }
}
