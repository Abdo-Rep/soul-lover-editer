import { useLayoutEffect } from 'react'
import { applySiteTheme, getDefaultAppearance } from '../utils/theme'

export default function ThemeApplier({ appearance }) {
  useLayoutEffect(() => {
    applySiteTheme(appearance ?? getDefaultAppearance())
  }, [appearance])

  return null
}
