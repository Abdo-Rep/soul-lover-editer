import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

const storageHeaders = {
  apikey: SECRET_KEY,
  Authorization: `Bearer ${JWT_TOKEN}`,
}

function getExt(filename) {
  return path.extname(filename || '').toLowerCase()
}

function getMime(ext) {
  const map = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.webm': 'audio/webm',
  }
  return map[ext] || 'application/octet-stream'
}

async function ensureBucket() {
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: { ...storageHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'site-media', name: 'site-media', public: true }),
    })
  } catch {
    // Bucket may already exist — ignore
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-category, x-slug')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const category = (req.query.category || req.headers['x-category'] || 'gallery').replace(/[^a-z0-9_-]/gi, '')
  const slug = (req.query.slug || req.headers['x-slug'] || 'default').replace(/[^a-z0-9_-]/gi, '')

  const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true })

  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(400).json({ error: 'فشل معالجة الملف' })

    const fileArr = files.file
    const file = Array.isArray(fileArr) ? fileArr[0] : fileArr
    if (!file) return res.status(400).json({ error: 'لم يتم إرسال ملف' })

    const ext = getExt(file.originalFilename || file.newFilename || '')
    const mime = getMime(ext)
    const timestamp = Date.now()
    const filename = `${category}-${timestamp}${ext}`
    const objectPath = `${slug}/${category}/${filename}`
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`

    try {
      const fileBuffer = fs.readFileSync(file.filepath)
      await ensureBucket()

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...storageHeaders,
          'Content-Type': mime,
          'x-upsert': 'true',
        },
        body: fileBuffer,
      })

      if (uploadRes.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/site-media/${objectPath}`
        return res.status(200).json({ success: true, url: publicUrl })
      } else {
        const errText = await uploadRes.text().catch(() => '')
        console.error('Supabase upload failed:', uploadRes.status, errText)
        return res.status(500).json({ error: `فشل رفع الملف على التخزين (${uploadRes.status})` })
      }
    } catch (uploadErr) {
      console.error('Upload handler error:', uploadErr)
      return res.status(500).json({ error: 'خطأ داخلي أثناء رفع الملف' })
    }
  })
}
