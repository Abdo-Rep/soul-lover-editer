const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

const storageHeaders = {
  apikey: SECRET_KEY,
  Authorization: `Bearer ${JWT_TOKEN}`,
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { fileUrl } = req.body || {}
  if (!fileUrl || typeof fileUrl !== 'string') {
    return res.status(400).json({ error: 'رابط الملف غير موجود' })
  }

  // Delete from Supabase Storage
  if (fileUrl.includes('/storage/v1/object/')) {
    const objectPath =
      fileUrl.split('/object/public/site-media/')[1] ||
      fileUrl.split('/object/site-media/')[1]

    if (objectPath) {
      try {
        await fetch(`${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`, {
          method: 'DELETE',
          headers: storageHeaders,
        })
      } catch {
        // Ignore delete errors — file may already be gone
      }
    }
  }

  return res.status(200).json({ success: true })
}
