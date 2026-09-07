/**
 * Formats a site name or slug into a clean display title.
 * - Single words like "soulove" stay as "soulove".
 * - Multi-part names like "mohamed-nora" or "mohamed_nora" become "mohamed & nora".
 * - Names like "mohamed-and-nora" become "mohamed & nora".
 */
export function formatSiteDisplayName(rawName, slug = '') {
  let target = (rawName || '').trim()
  if (!target && slug) {
    target = slug.trim()
  }
  if (!target) return 'soulove'

  // If already formatted with ' & ' or ' و '
  if (target.includes(' & ') || target.includes(' و ')) {
    return target
  }

  // Handle hyphen/underscore separated strings (e.g. mohamed-nora, mohamed_nora, ahmed-and-sara)
  if (target.includes('-') || target.includes('_')) {
    let formatted = target
      .replace(/[-_]+and[-_]+/gi, ' & ')
      .replace(/[-_]+/g, ' & ')
      .trim()
    return formatted
  }

  return target
}
