import { ASSETS_BUCKET, isSupabaseConfigured, supabase } from '../lib/supabase'
import { compressImageFile } from './compressImage'
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

function stripUrlField(value) {
  return value?.startsWith('http') ? value : ''
}

function stripHeavyFields(content) {
  const { gallery, ...rest } = content
  const strippedGallery = gallery ? { ...gallery } : {}
  delete strippedGallery.finalButton

  return {
    ...rest,
    gallery: strippedGallery,
    music: {
      ...rest.music,
      src: stripUrlField(rest.music.src),
    },
    memories: rest.memories.map((memory) => ({
      ...memory,
      image: stripUrlField(memory.image),
    })),
    galleryItems: (content.galleryItems ?? []).map((item) => ({
      ...item,
      image: stripUrlField(item.image),
    })),
  }
}

function isEmptyRemotePayload(data) {
  return !data || typeof data !== 'object' || Object.keys(data).length === 0
}

export async function fetchRemoteContent() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('تعذّر الاتصال بالخادم')
  }

  const { data, error } = await supabase.rpc('get_site_content')
  if (error) throw error

  if (isEmptyRemotePayload(data)) return null
  return mergeContent(data)
}

export async function verifySitePassword(password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('تعذّر الاتصال بالخادم')
  }

  const { data, error } = await supabase.rpc('verify_site_password', {
    p_password: password,
  })

  if (error) throw error
  return Boolean(data)
}

export async function saveRemoteContent(content, password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('تعذّر الاتصال بالخادم')
  }
  if (!password) {
    throw new Error('كلمة المرور مطلوبة للحفظ')
  }

  const payload = stripHeavyFields(content)
  let { error } = await supabase.rpc('save_site_content', {
    p_password: password,
    p_content: payload,
  })

  // Fallback: If the DB RPC hasn't been updated with adminPassword support,
  // it will reject the admin password but accept the visitor password.
  if (error && error.message?.includes('invalid_password') && content.password && content.password !== password) {
    const retryResult = await supabase.rpc('save_site_content', {
      p_password: content.password,
      p_content: payload,
    })
    error = retryResult.error
  }

  if (error) {
    if (error.message?.includes('invalid_password')) {
      throw new Error('invalid_password')
    }
    throw error
  }

  return mergeContent(payload)
}

export async function seedRemoteContentIfEmpty() {
  const existing = await fetchRemoteContent()
  if (existing) return existing

  return mergeContent(getSeedContent())
}

export async function loadSiteContent() {
  const remote = await fetchRemoteContent()
  if (remote) return remote
  return mergeContent(getSeedContent())
}

function guessMimeType(file) {
  if (file.type) return file.type

  const extension = file.name.split('.').pop()?.toLowerCase()
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp3: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    mpga: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    wave: 'audio/wav',
    m4a: 'audio/mp4',
    mp4: 'audio/mp4',
    aac: 'audio/aac',
    flac: 'audio/flac',
    webm: 'audio/webm',
    weba: 'audio/webm',
    opus: 'audio/opus',
    amr: 'audio/amr',
    mid: 'audio/midi',
    midi: 'audio/midi',
  }

  return map[extension] || 'application/octet-stream'
}

export function isAudioFile(file) {
  return true
}

function safeRandomUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function uploadAsset(file, folder) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('تعذّر رفع الملف')
  }

  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|heic|svg)$/i.test(file.name)
  let prepared = file

  if (isImage) {
    try {
      prepared = await compressImageFile(file)
    } catch (e) {
      console.warn('Compress image failed, fallback to original:', e)
    }
  }

  let extension = prepared.name.split('.').pop()?.toLowerCase() || 'bin'
  let contentType = guessMimeType(prepared)

  if (isImage) {
    extension = 'webp'
    contentType = 'image/webp'
  } else if (folder === 'music') {
    extension = 'mp3'
    contentType = 'audio/mpeg'
  }

  const path = `${folder}/${safeRandomUUID()}.${extension}`

  let uploadFile = prepared
  if (contentType) {
    try {
      const fileName = isImage
        ? `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`
        : prepared.name
      uploadFile = new File([prepared], fileName, { type: contentType })
    } catch (e) {
      console.warn('Failed to override File type, uploading original:', e)
    }
  }

  const { error } = await supabase.storage.from(ASSETS_BUCKET).upload(path, uploadFile, {
    cacheControl: '31536000',
    upsert: true,
    contentType,
  })

  if (error) throw error

  const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function pushContentToCloud(content, password) {
  return saveRemoteContent(content, password)
}
