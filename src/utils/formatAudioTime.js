export function formatAudioTime(seconds, { padMinutes = false } = {}) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  const minLabel = padMinutes
    ? mins.toString().padStart(2, '0')
    : String(mins)

  return `${minLabel}:${secs.toString().padStart(2, '0')}`
}
