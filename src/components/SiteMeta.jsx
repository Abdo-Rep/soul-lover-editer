import { useEffect } from 'react'
import { useContent } from '../context/ContentContext'

export default function SiteMeta() {
  const { content } = useContent()

  useEffect(() => {
    const title = content?.siteName?.trim() || 'soulove'
    
    // 1. Update Document Title dynamically
    document.title = title

    // 2. Update <meta name="application-name">
    let metaAppName = document.querySelector('meta[name="application-name"]')
    if (metaAppName) {
      metaAppName.setAttribute('content', title)
    } else {
      metaAppName = document.createElement('meta')
      metaAppName.setAttribute('name', 'application-name')
      metaAppName.setAttribute('content', title)
      document.head.appendChild(metaAppName)
    }

    // 3. Update <meta property="og:title"> for social links
    let metaOgTitle = document.querySelector('meta[property="og:title"]')
    if (metaOgTitle) {
      metaOgTitle.setAttribute('content', title)
    } else {
      metaOgTitle = document.createElement('meta')
      metaOgTitle.setAttribute('property', 'og:title')
      metaOgTitle.setAttribute('content', title)
      document.head.appendChild(metaOgTitle)
    }

    // 4. Update <meta name="theme-color"> to match background color
    const bgColor = content?.appearance?.mode === 'dark' ? '#0f172a' : '#fff1f2'
    let metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', bgColor)
    }
  }, [content?.siteName, content?.appearance])

  return null
}
