import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'soulove-jwt-secret-key-2026'
const UPLOADS_ROOT = process.env.UPLOADS_ROOT || '/var/www/uploads'
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || 'https://media.soulove.app'

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

// Serve static files locally for testing or when proxied
if (fs.existsSync(UPLOADS_ROOT)) {
  app.use('/uploads', express.static(UPLOADS_ROOT))
}

// 1. JWT Authentication Middleware
function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token

  if (!token) {
    return res.status(401).json({ error: 'unauthorized_missing_token' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded || !decoded.slug) {
      return res.status(401).json({ error: 'invalid_token_payload' })
    }
    req.tenantSlug = decoded.slug
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid_or_expired_token' })
  }
}

// 2. Multer Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const slug = req.tenantSlug
    const category = (req.body.category || req.query.category || 'gallery')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')

    const targetDir = path.join(UPLOADS_ROOT, slug, category)
    fs.mkdirSync(targetDir, { recursive: true })
    cb(null, targetDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin'
    const sanitizeExt = ext.replace(/[^.a-z0-9]/g, '')
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${sanitizeExt}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB limit filter
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
    const isAudio = file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i)

    if (isAudio && file.size > 7 * 1024 * 1024) {
      return cb(new Error('حجم ملف الأغنية يفضل ألا يتجاوز 7 ميجابايت (الحد الأقصى 7 MB)'))
    }

    if (!isImage && !isAudio) {
      return cb(new Error('نوع الملف غير مدعوم (صور أو صوتيات فقط)'))
    }

    cb(null, true)
  },
})

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Soulove VPS Media Server', timestamp: new Date().toISOString() })
})

// 4. Upload Endpoint
app.post('/api/upload', authenticateAdminToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'فشل رفع الملف' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم اختيار ملف للرفع' })
    }

    const slug = req.tenantSlug
    const category = (req.body.category || req.query.category || 'gallery')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')

    const publicUrl = `${MEDIA_BASE_URL.replace(/\/$/, '')}/uploads/${slug}/${category}/${req.file.filename}`

    return res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
    })
  })
})

// 5. Delete Asset Endpoint (Physical file deletion from disk)
app.post('/api/delete', authenticateAdminToken, (req, res) => {
  const { fileUrl } = req.body || {}
  if (!fileUrl || typeof fileUrl !== 'string') {
    return res.status(400).json({ error: 'fileUrl_required' })
  }

  try {
    const slug = req.tenantSlug
    // Ensure the file URL belongs to this tenant
    const expectedPrefix = `/uploads/${slug}/`
    if (!fileUrl.includes(expectedPrefix)) {
      return res.status(403).json({ error: 'unauthorized_file_deletion' })
    }

    const relativePath = fileUrl.split(expectedPrefix)[1]
    if (!relativePath || relativePath.includes('..')) {
      return res.status(400).json({ error: 'invalid_path_traversal' })
    }

    const absolutePath = path.join(UPLOADS_ROOT, slug, relativePath)

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
      return res.status(200).json({ success: true, deletedPath: relativePath })
    }

    return res.status(200).json({ success: true, message: 'file_not_found_or_already_deleted' })
  } catch (err) {
    console.error('Delete Asset Error:', err)
    return res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Soulove Media Server listening on port ${PORT}`)
})
