import { getSeedContent, mergeContent } from './contentMerge'

const ADMIN_PASSWORD_KEY = 'romantic-site-admin-password'
let adminPasswordMemory = ''

if (typeof sessionStorage !== 'undefined') {
  adminPasswordMemory = sessionStorage.getItem(ADMIN_PASSWORD_KEY) || ''
}

export function setAdminPasswordForSync(password) {
  adminPasswordMemory = password || ''
  if (password) {
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, password)
  } else {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY)
  }
}

export function getAdminPasswordForSync() {
  return adminPasswordMemory || sessionStorage.getItem(ADMIN_PASSWORD_KEY) || ''
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
    return res.ok
  } catch (e) {
    return false
  }
}

export async function saveRemoteContent(content, password, slug) {
  if (!slug) {
    throw new Error('معرف الموقع غير موضح')
  }
  if (!password) {
    throw new Error('كلمة المرور مطلوبة للحفظ')
  }

  const res = await fetch(`/api/sites?slug=${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password,
      content,
    }),
  })

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
}

export async function loadSiteContent(slug) {
  if (!slug) return null
  return await fetchRemoteContent(slug)
}

export function isAudioFile() {
  return true
}

// Canvas-based image compression before base64 generation
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }

    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(new Error('فشل معالجة وضغط الصورة'))
    }

    img.src = url
  })
}

export async function uploadAsset(file) {
  if (!file) throw new Error('لم يتم اختيار ملف')

  const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i)
  const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)

  // 1. Enforce 7MB max size for audio files
  if (isAudio) {
    const MAX_AUDIO_SIZE = 7 * 1024 * 1024 // 7MB
    if (file.size > MAX_AUDIO_SIZE) {
      throw new Error('حجم ملف الأغنية يفضل ألا يتجاوز 7 ميجابايت (الحد الأقصى 7 MB)')
    }
  }

  // 2. Compress image files using Canvas
  if (isImage && !file.type.includes('svg')) {
    try {
      return await compressImage(file)
    } catch (e) {
      console.warn('Compression fallback to raw reader:', e)
    }
  }

  // 3. Fallback FileReader
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
