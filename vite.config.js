import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitesHandler from './api/sites.js'
import superAdminHandler from './api/super-admin.js'
import fs from 'fs'
import path from 'path'

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

        // Helper response methods
        if (!res.status) {
          res.status = function (code) {
            res.statusCode = code
            return res
          }
        }
        if (!res.json) {
          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return res
          }
        }

        req.query = Object.fromEntries(url.searchParams)

        // Serve /uploads/* static files directly with correct MIME types
        if (url.pathname.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', url.pathname)
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase()
            let mime = 'image/jpeg'
            if (ext === '.png') mime = 'image/png'
            else if (ext === '.webp') mime = 'image/webp'
            else if (ext === '.gif') mime = 'image/gif'
            else if (ext === '.mp3') mime = 'audio/mpeg'
            else if (ext === '.wav') mime = 'audio/wav'
            
            res.setHeader('Content-Type', mime)
            res.setHeader('Cache-Control', 'public, max-age=31536000')
            return fs.createReadStream(filePath).pipe(res)
          }
        }

        // Handle /api/media proxy for local dev (mirrors Vercel proxy)
        if (url.pathname === '/api/media' && req.method === 'GET') {
          const mediaPath = url.searchParams.get('path')
          if (!mediaPath) {
            return res.status(400).json({ error: 'Missing path' })
          }
          const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
          const targetUrl = `${SUPABASE_URL}/storage/v1/object/public/site-media/${mediaPath}`
          try {
            const upstream = await fetch(targetUrl)
            if (!upstream.ok) {
              res.statusCode = upstream.status
              return res.end('Not found')
            }
            const ct = upstream.headers.get('content-type') || 'application/octet-stream'
            res.setHeader('Content-Type', ct)
            res.setHeader('Cache-Control', 'public, max-age=31536000')
            const buf = Buffer.from(await upstream.arrayBuffer())
            res.statusCode = 200
            return res.end(buf)
          } catch (err) {
            console.error('Dev media proxy error:', err)
            res.statusCode = 500
            return res.end('Proxy error')
          }
        }

        // Handle /api/upload for local dev server
        if (url.pathname === '/api/upload' && req.method === 'POST') {
          const chunks = []
          req.on('data', (chunk) => chunks.push(chunk))
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks)
              const contentType = req.headers['content-type'] || ''
              
              const category = (req.headers['x-category'] || req.query.category || 'gallery').toLowerCase().replace(/[^a-z0-9_-]/g, '')
              const slug = (req.headers['x-slug'] || req.query.slug || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '')

              let ext = '.jpg'
              if (contentType.includes('image/png')) ext = '.png'
              else if (contentType.includes('image/jpeg')) ext = '.jpg'
              else if (contentType.includes('image/webp')) ext = '.webp'
              else if (contentType.includes('image/gif')) ext = '.gif'
              else if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) ext = '.mp3'
              else if (contentType.includes('audio/wav')) ext = '.wav'
              else if (contentType.includes('audio/webm')) ext = '.webm'
              else if (contentType.includes('audio/ogg')) ext = '.ogg'
              else if (contentType.includes('audio/mp4') || contentType.includes('audio/m4a') || contentType.includes('audio/aac')) ext = '.m4a'

              // Strip multipart headers accurately using Content-Type boundary
              let fileData = buffer
              if (contentType.includes('boundary=')) {
                const boundaryStr = '--' + contentType.split('boundary=')[1].split(';')[0].trim()
                const boundaryBuf = Buffer.from(boundaryStr)
                const firstBoundaryIdx = buffer.indexOf(boundaryBuf)
                if (firstBoundaryIdx !== -1) {
                  const headerEndIdx = buffer.indexOf('\r\n\r\n', firstBoundaryIdx)
                  if (headerEndIdx !== -1) {
                    const dataStart = headerEndIdx + 4
                    const lastBoundaryIdx = buffer.lastIndexOf(boundaryBuf)
                    if (lastBoundaryIdx > dataStart) {
                      let dataEnd = lastBoundaryIdx
                      if (buffer[dataEnd - 1] === 0x0a && buffer[dataEnd - 2] === 0x0d) {
                        dataEnd -= 2
                      }
                      fileData = buffer.slice(dataStart, dataEnd)
                    }
                  }
                }
              }

              const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
              
              // Save local backup file
              const targetDir = path.join(process.cwd(), 'public', 'uploads', category, slug)
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true })
              }
              const filePath = path.join(targetDir, filename)
              fs.writeFileSync(filePath, fileData)

              const localPublicUrl = `/uploads/${category}/${slug}/${filename}`
              
              let fileMime = 'image/jpeg'
              if (ext === '.webp') fileMime = 'image/webp'
              else if (ext === '.png') fileMime = 'image/png'
              else if (ext === '.mp3') fileMime = 'audio/mpeg'
              else if (ext === '.wav') fileMime = 'audio/wav'
              else if (ext === '.webm') fileMime = 'audio/webm'
              else if (ext === '.ogg') fileMime = 'audio/ogg'
              else if (ext === '.m4a' || ext === '.aac') fileMime = 'audio/mp4'

              const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
              const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
              const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

              const storageHeaders = {
                'apikey': SECRET_KEY,
                'Authorization': `Bearer ${JWT_TOKEN}`,
              }

              // Ensure public bucket 'site-media' exists then upload object
              const objectPath = `${slug}/${category}/${filename}`
              const uploadUrl = `${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`

              const doUpload = () => {
                fetch(uploadUrl, {
                  method: 'POST',
                  headers: {
                    ...storageHeaders,
                    'Content-Type': fileMime,
                    'x-upsert': 'true',
                  },
                  body: fileData,
                })
                  .then(async (sRes) => {
                    if (sRes.ok) {
                      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/site-media/${objectPath}`
                      return res.status(200).json({ success: true, url: publicUrl })
                    }
                    // Fallback to local URL if storage upload failed
                    return res.status(200).json({ success: true, url: localPublicUrl })
                  })
                  .catch(() => {
                    return res.status(200).json({ success: true, url: localPublicUrl })
                  })
              }

              // Ensure bucket exists
              fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
                method: 'POST',
                headers: {
                  ...storageHeaders,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: 'site-media', name: 'site-media', public: true }),
              })
                .then(() => doUpload())
                .catch(() => doUpload())

              return
            } catch (err) {
              console.error('Dev upload error:', err)
              return res.status(500).json({ error: 'Failed to save uploaded file' })
            }
          })
          return
        }

        // Handle /api/delete for local dev server
        if (url.pathname === '/api/delete' && req.method === 'POST') {
          const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
          const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
          const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''
          const storageHeaders = {
            'apikey': SECRET_KEY,
            'Authorization': `Bearer ${JWT_TOKEN}`,
          }
          const { fileUrl } = req.body || {}
          if (fileUrl && typeof fileUrl === 'string' && fileUrl.includes('/storage/v1/object/')) {
            const objectPath = fileUrl.split('/object/public/site-media/')[1] || fileUrl.split('/object/site-media/')[1]
            if (objectPath) {
              fetch(`${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`, {
                method: 'DELETE',
                headers: storageHeaders,
              }).catch(() => {})
            }
          }
          // Also delete local file if it's a local /uploads/ path
          if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('/uploads/')) {
            const localPath = path.join(process.cwd(), 'public', fileUrl)
            if (fs.existsSync(localPath)) {
              fs.unlink(localPath, () => {})
            }
          }
          return res.status(200).json({ success: true })
        }

        if (url.pathname !== '/api/sites' && url.pathname !== '/api/super-admin') {
          return next()
        }

        const handleRequest = async () => {
          try {
            if (url.pathname === '/api/sites') {
              await sitesHandler(req, res)
            } else if (url.pathname === '/api/super-admin') {
              await superAdminHandler(req, res)
            }
          } catch (err) {
            console.error('Vite API Plugin error:', err)
            res.status(500).json({ error: 'حدث خطأ داخلي في الخادم' })
          }
        }

        if (req.readableEnded) {
          handleRequest()
        } else {
          let body = ''
          req.on('data', (chunk) => (body += chunk))
          req.on('end', () => {
            if (body) {
              try {
                req.body = JSON.parse(body)
              } catch (e) {}
            }
            handleRequest()
          })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  server: {
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/storage': {
        target: process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/storage/, '/storage/v1/object/public'),
      }
    }
  },
})
