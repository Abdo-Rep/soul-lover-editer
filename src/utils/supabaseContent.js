import { getSeedContent, mergeContent } from './contentMerge'

const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL || 'https://media.soulove.app'

function getSlugFromPath() {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts.length === 0) return ''
  if (parts[0] === 'soulove-admin' || parts[0] === 'api' || parts[0] === 'dashboard') return ''
  return parts[0]
}

export function setAdminPasswordForSync(password, slug = '') {
  const activeSlug = slug || getSlugFromPath()
  if (password) {
    if (activeSlug) {
      sessionStorage.setItem(`romantic-pass-${activeSlug}`, password)
    }
  } else {
    if (activeSlug) {
      sessionStorage.removeItem(`romantic-pass-${activeSlug}`)
      sessionStorage.removeItem(`romantic-token-${activeSlug}`)
    }
  }
}

export function getAdminPasswordForSync(slug = '') {
  const activeSlug = slug || getSlugFromPath()
  if (activeSlug) {
    return sessionStorage.getItem(`romantic-pass-${activeSlug}`) || ''
  }
  return ''
}

export function getAdminTokenForSync(slug = '') {
  const activeSlug = slug || getSlugFromPath()
  if (activeSlug) {
    return sessionStorage.getItem(`romantic-token-${activeSlug}`) || ''
  }
  return ''
}

export function setAdminTokenForSync(token, slug = '') {
  const activeSlug = slug || getSlugFromPath()
  if (activeSlug) {
    if (token) {
      sessionStorage.setItem(`romantic-token-${activeSlug}`, token)
    } else {
      sessionStorage.removeItem(`romantic-token-${activeSlug}`)
    }
  }
}

export async function fetchRemoteContent(slug) {
  if (!slug) return mergeContent(getSeedContent())

  const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`)

  if (res.status === 444 || res.status === 404) {
    return null
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '')
    console.warn('Non-JSON response from /api/sites:', text.slice(0, 100))
    return null
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'تعذّر الاتصال بالخادم')
  }

  const json = await res.json()
  return mergeContent(json.data)
}

// 100% Server-Side Visitor Password Verification
export async function verifySitePassword(password, slug) {
  if (!slug) return true
  try {
    const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'verify_visitor' }),
    })
    return res.ok
  } catch (e) {
    return false
  }
}

// 100% Server-Side Admin Dashboard Password Verification
export async function verifyAdminPassword(password, slug) {
  if (!slug) return false
  try {
    const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'verify_admin' }),
    })
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    if (data.token) {
      setAdminTokenForSync(data.token, slug)
      setAdminPasswordForSync(password, slug)
    }
    return true
  } catch (e) {
    return false
  }
}

export async function saveRemoteContent(content, password, slug) {
  if (!slug) {
    throw new Error('معرف الموقع غير موضح')
  }

  const token = getAdminTokenForSync(slug)

  if (!password && !token) {
    throw new Error('سجّل خروج ثم ادخل من جديد بكلمة المرور الحالية')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        password,
        token,
        content,
      }),
    })
    clearTimeout(timeoutId)

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '')
      throw new Error(`خطأ من الخادم (${res.status}): ${text.slice(0, 80)}`)
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      if (res.status === 401 || errJson.error === 'invalid_password') {
        throw new Error('invalid_password')
      }
      throw new Error(errJson.error || 'فشل حفظ التعديلات على الخادم')
    }

    const resData = await res.json()
    return mergeContent(resData.data)
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('استغرق الحفظ وقتًا طويلاً. يُرجى التحقق من الاتصال والمحاولة مرة أخرى.')
    }
    throw error
  }
}

export async function loadSiteContent(slug) {
  if (!slug) return null
  return await fetchRemoteContent(slug)
}

export function isAudioFile() {
  return true
}

export async function uploadAsset(file, category = 'gallery', slug = '') {
  if (!file) throw new Error('لم يتم اختيار ملف')

  const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i)

  // 1. Enforce 7MB max size for audio files
  if (isAudio && file.size > 7 * 1024 * 1024) {
    throw new Error('حجم ملف الأغنية يفضل ألا يتجاوز 7 ميجابايت (الحد الأقصى 7 MB)')
  }

  const token = slug ? getAdminTokenForSync(slug) : ''
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const uploadEndpoint = `${MEDIA_SERVER_URL.replace(/\/$/, '')}/api/upload`

  try {
    const res = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson.error || 'فشل رفع الملف إلى خادم الميديا')
    }

    const data = await res.json()
    if (!data.url) throw new Error('تعذّر الحصول على رابط الملف المرفوع')
    return data.url
  } catch (err) {
    console.error('Direct VPS Upload Error:', err)
    throw new Error(err.message || 'تعذّر اتصال الرفع بخادم الميديا')
  }
}
