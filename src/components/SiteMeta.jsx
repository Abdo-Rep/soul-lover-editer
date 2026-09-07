import { useEffect } from 'react'
import { useContent } from '../context/ContentContext'
import { formatSiteDisplayName } from '../utils/formatSiteName'

function setMetaTag(attribute, key, content) {
  if (!content) return
  let element = document.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export default function SiteMeta() {
  const { content, getClientSlug } = useContent()

  useEffect(() => {
    const path = window.location.pathname
    const parts = path.split('/').filter(Boolean)
    const isSuperAdmin = parts[0] === 'soulove-admin'
    const slug = isSuperAdmin ? '' : (getClientSlug?.() || parts[0] || '')
    const formattedName = isSuperAdmin ? 'Soulove' : formatSiteDisplayName(content?.siteName, slug)
    const title = formattedName || 'Soulove'
    const description = content?.welcome?.subtitle || content?.login?.subtitle || 'قصة حبنا، ذكرياتنا، وكل نبضة في قلبي — صُنع بحب لكِ وحدك.'
    const coverImage = content?.memories?.[0]?.image || content?.galleryItems?.[0]?.image || content?.galleryItems?.[0]?.url || 'https://media.soulove.app/uploads/default-cover.jpg'
    const pageUrl = window.location.href

    // 1. Dynamic Page Title
    document.title = title

    // 2. Core SEO Description & App Name
    setMetaTag('name', 'description', description)
    setMetaTag('name', 'application-name', title)
    setMetaTag('name', 'theme-color', content?.appearance?.primaryColor || (content?.appearance?.mode === 'dark' ? '#110a18' : '#fff1f2'))

    // 3. Open Graph Social Card Tags (WhatsApp, Telegram, Messenger, iMessage, Facebook)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:image', coverImage)
    setMetaTag('property', 'og:url', pageUrl)
    setMetaTag('property', 'og:site_name', title)

    // 4. Dynamic Isolated PWA Manifest generation (3 Separate Standalone Apps!)
    const isDark = content?.appearance?.mode === 'dark'

    let manifestId = '/'
    let manifestScope = '/'
    let startUrl = path || '/'
    let appName = title
    let shortName = content?.siteName || 'موقعنا'
    let themeColor = isDark ? '#0b0a12' : (content?.appearance?.primaryColor || '#fb7185')
    let bgColor = isDark ? '#0b0a12' : '#fff1f2'

    if (parts[0] === 'soulove-admin') {
      // App 1: Super Admin App (Isolated PWA)
      manifestId = '/soulove-admin/'
      manifestScope = '/soulove-admin/'
      startUrl = '/soulove-admin'
      appName = 'Soulove Control — لوحة تحكم المنصة 👑'
      shortName = 'Super Admin'
      themeColor = '#060713'
      bgColor = '#060713'
    } else if (parts.length >= 2 && (parts[1] === 'dashboard' || parts[1] === 'login')) {
      // App 2: Client Dashboard App (Isolated PWA per client)
      const slug = parts[0]
      manifestId = `/${slug}/dashboard/`
      manifestScope = `/${slug}/dashboard/`
      startUrl = `/${slug}/dashboard`
      appName = `لوحة التحكم — ${content?.siteName || slug}`
      shortName = `لوحة التحكم`
      themeColor = '#060814'
      bgColor = '#060814'
    } else if (parts.length >= 1) {
      // App 3: Client Visitor Website App (Isolated PWA per site)
      const slug = parts[0]
      manifestId = `/${slug}/`
      manifestScope = `/${slug}/`
      startUrl = `/${slug}`
      appName = content?.siteName?.trim() || title
      shortName = content?.siteName?.trim() || 'موقعنا'
      themeColor = isDark ? '#0b0a12' : (content?.appearance?.primaryColor || '#fb7185')
      bgColor = isDark ? '#0b0a12' : '#fff1f2'
    }

    setMetaTag('name', 'theme-color', themeColor)

    const dynamicManifest = {
      id: manifestId,
      scope: manifestScope,
      name: appName,
      short_name: shortName,
      description: description,
      start_url: startUrl,
      display: 'standalone',
      background_color: bgColor,
      theme_color: themeColor,
      orientation: 'portrait',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
      ]
    }

    const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/json' })
    const manifestUrl = URL.createObjectURL(manifestBlob)

    let manifestLink = document.querySelector('link[rel="manifest"]')
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.setAttribute('rel', 'manifest')
      document.head.appendChild(manifestLink)
    }
    manifestLink.setAttribute('href', manifestUrl)

    // 5. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', coverImage)

    return () => {
      URL.revokeObjectURL(manifestUrl)
    }
  }, [content])

  return null
}
