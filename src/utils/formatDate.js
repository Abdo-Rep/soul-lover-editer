export function formatDateLong(dateString) {
  if (!dateString) return null

  const cleanDateStr = String(dateString).trim().split('T')[0]
  const parts = cleanDateStr.split('-')

  if (parts.length === 3) {
    const [year, month, day] = parts
    if (year && month && day && year.length === 4) {
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`
    }
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${year}/${month}/${day}`
}
