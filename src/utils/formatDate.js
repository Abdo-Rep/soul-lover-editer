const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

export function formatDateLong(dateString) {
  if (!dateString) return null

  const cleanDateStr = String(dateString).trim().split('T')[0]
  const parts = cleanDateStr.split('-')

  if (parts.length === 3) {
    const [yearStr, monthStr, dayStr] = parts
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    const day = parseInt(dayStr, 10)

    if (year && month >= 1 && month <= 12 && day) {
      return `${day} ${MONTH_NAMES_AR[month - 1]} ${year}`
    }
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  return `${day} ${MONTH_NAMES_AR[month]} ${year}`
}
