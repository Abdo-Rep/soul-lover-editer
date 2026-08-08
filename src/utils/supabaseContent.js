import { getSeedContent, mergeContent } from './contentMerge'

const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL || ''

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
    try {
      const errJson = await res.json()
      return { siteNotFound: true, language: errJson.language || 'ar' }
    } catch {
      return { siteNotFound: true, language: 'ar' }
    }
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
  const content = mergeContent(json.data)
  if (content) {
    content.language = json.language || 'ar'
    content.isActive = json.isActive !== false
  }
  return content
}

// 100% Server-Side Visitor Password Verification
export async function verifySitePassword(password, slug) {
  if (!slug) return true
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'verify_visitor' }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return res.ok
  } catch (e) {
    return false
  }
}

// 100% Server-Side Admin Dashboard Password Verification
export async function verifyAdminPassword(password, slug) {
  if (!slug) return false
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'verify_admin' }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
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

// Convert base64 data URL to a File object for automatic uploading
export function base64ToFile(base64String, filename = 'uploaded-asset') {
  try {
    const arr = base64String.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    const ext = mime.split('/')[1] || 'png'
    return new File([u8arr], `${filename}.${ext}`, { type: mime })
  } catch (err) {
    console.error('Failed to convert base64 to file:', err)
    return null
  }
}

// Automatically scan and upload any Base64 strings in content before saving
export async function autoUploadBase64Content(content, slug) {
  if (!content || typeof content !== 'object') return content

  const contentStr = JSON.stringify(content)
  if (!contentStr.includes('data:')) {
    return content
  }

  const sanitized = JSON.parse(contentStr)

  // 1. Memories images
  if (Array.isArray(sanitized.memories)) {
    for (let i = 0; i < sanitized.memories.length; i++) {
      const memory = sanitized.memories[i]
      if (memory?.image && typeof memory.image === 'string' && memory.image.startsWith('data:')) {
        try {
          const file = base64ToFile(memory.image, `memory-${memory.id || i}`)
          if (file) {
            const url = await uploadAsset(file, 'memories', slug)
            sanitized.memories[i].image = url
          } else {
            sanitized.memories[i].image = ''
          }
        } catch {
          sanitized.memories[i].image = ''
        }
      }
    }
  }

  // 2. Gallery items images
  if (Array.isArray(sanitized.galleryItems)) {
    for (let i = 0; i < sanitized.galleryItems.length; i++) {
      const item = sanitized.galleryItems[i]
      const imgStr = item?.image || item?.url || ''
      if (typeof imgStr === 'string' && imgStr.startsWith('data:')) {
        try {
          const file = base64ToFile(imgStr, `gallery-${item.id || i}`)
          if (file) {
            const url = await uploadAsset(file, 'gallery', slug)
            sanitized.galleryItems[i].image = url
            sanitized.galleryItems[i].url = url
          } else {
            sanitized.galleryItems[i].image = ''
            sanitized.galleryItems[i].url = ''
          }
        } catch {
          sanitized.galleryItems[i].image = ''
          sanitized.galleryItems[i].url = ''
        }
      }
    }
  }

  // 3. Music tracks
  if (sanitized.music) {
    if (Array.isArray(sanitized.music.tracks)) {
      for (let i = 0; i < sanitized.music.tracks.length; i++) {
        const track = sanitized.music.tracks[i]
        if (track?.src && typeof track.src === 'string' && track.src.startsWith('data:')) {
          try {
            const file = base64ToFile(track.src, `music-${track.id || i}`)
            if (file) {
              const url = await uploadAsset(file, 'music', slug)
              sanitized.music.tracks[i].src = url
            } else {
              sanitized.music.tracks[i].src = ''
            }
          } catch {
            sanitized.music.tracks[i].src = ''
          }
        }
      }
    }

    if (sanitized.music.src && typeof sanitized.music.src === 'string' && sanitized.music.src.startsWith('data:')) {
      try {
        const file = base64ToFile(sanitized.music.src, 'music-main')
        if (file) {
          const url = await uploadAsset(file, 'music', slug)
          sanitized.music.src = url
        } else {
          sanitized.music.src = ''
        }
      } catch {
        sanitized.music.src = ''
      }
    }
  }

  return sanitized
}

export async function saveRemoteContent(content, password, slug) {
  if (!slug) {
    throw new Error('معرف الموقع غير موضح')
  }

  const token = getAdminTokenForSync(slug)

  if (!password && !token) {
    throw new Error('سجّل خروج ثم ادخل من جديد بكلمة المرور الحالية')
  }

  // Auto upload any leftover Base64 media files before saving JSON payload
  const cleanContent = await autoUploadBase64Content(content, slug)

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
        content: cleanContent,
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

export function isAudioFile(file) {
  if (!file) return false
  if (file.type && file.type.toLowerCase().startsWith('audio/')) return true
  if (file.name && /\.(mp3|wav|ogg|flac|aac|m4a|webm|opus|mpga|3gp)$/i.test(file.name)) return true
  return false
}

export async function uploadAsset(file, category = 'gallery', slug = '') {
  if (!file) throw new Error('لم يتم اختيار ملف')

  const activeSlug = slug || getSlugFromPath() || 'default'
  const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i)

  // Enforce 12MB max size for audio files
  if (isAudio && file.size > 12 * 1024 * 1024) {
    throw new Error('حجم ملف الأغنية يفضل ألا يتجاوز 12 ميجابايت (الحد الأقصى 12 MB)')
  }

  const token = activeSlug ? getAdminTokenForSync(activeSlug) : ''
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
  const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5P_VM3IgahU8L9piC6RKWq_cgCBwlgW'

  // For files larger than 4MB, upload directly to Supabase storage to bypass Vercel's 4.5MB Serverless function limit (Error 413)
  if (file.size > 4 * 1024 * 1024) {
    try {
      const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : (isAudio ? '.mp3' : '.jpg')
      const filename = `${category}-${Date.now()}${ext}`
      const objectPath = `${activeSlug}/${category}/${filename}`
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`

      const directRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: file,
      })

      if (directRes.ok) {
        return `${SUPABASE_URL}/storage/v1/object/public/site-media/${objectPath}`
      }
    } catch (e) {
      console.warn('Direct upload error for large file:', e)
    }
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const endpoints = []
  if (MEDIA_SERVER_URL) {
    endpoints.push(`${MEDIA_SERVER_URL.replace(/\/$/, '')}/api/upload`)
  }
  endpoints.push(`/api/upload?category=${encodeURIComponent(category)}&slug=${encodeURIComponent(activeSlug)}`)

  let lastError = null
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-category': category,
          'x-slug': activeSlug,
        },
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) return data.url
      } else {
        const errJson = await res.json().catch(() => ({}))
        lastError = errJson.error || `خطأ الخادم (${res.status})`
      }
    } catch (err) {
      lastError = err.message || 'فشل الاتصال'
    }
  }

  // Direct Supabase Storage fallback (resilient upload)
  try {
    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '.jpg'
    const filename = `${category}-${Date.now()}${ext}`
    const objectPath = `${activeSlug}/${category}/${filename}`
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`

    const directRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    })

    if (directRes.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/site-media/${objectPath}`
    }
  } catch (e) {
    console.warn('Direct upload fallback error:', e)
  }

  throw new Error(lastError || 'تعذّر رفع الملف')
}

export async function deleteAsset(fileUrl, slug = '') {
  if (!fileUrl || typeof fileUrl !== 'string') return false
  const activeSlug = slug || getSlugFromPath() || 'default'
  const token = activeSlug ? getAdminTokenForSync(activeSlug) : ''

  const endpoints = []
  if (MEDIA_SERVER_URL) {
    endpoints.push(`${MEDIA_SERVER_URL.replace(/\/$/, '')}/api/delete`)
  }
  endpoints.push('/api/delete')

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fileUrl, slug: activeSlug }),
      })
      if (res.ok) return true
    } catch {
      // Background physical cleanup fail silent fallback
    }
  }
  return false
}
