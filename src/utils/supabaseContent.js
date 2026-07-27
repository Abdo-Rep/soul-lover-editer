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

export async function verifySitePassword(password, slug) {
  if (!slug) return true
  const data = await fetchRemoteContent(slug)
  if (!data) return false
  return data.password === password
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
  if (!slug) return mergeContent(getSeedContent())
  const remote = await fetchRemoteContent(slug)
  if (remote) return remote
  return mergeContent(getSeedContent())
}

export function isAudioFile() {
  return true
}

export async function uploadAsset(file) {
  // Convert image/audio file to base64 data URL for self-contained serverless storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
