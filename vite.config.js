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
      server.middlewares.use((req, res, next) => {
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

              let ext = '.bin'
              if (contentType.includes('image/png')) ext = '.png'
              else if (contentType.includes('image/jpeg')) ext = '.jpg'
              else if (contentType.includes('image/webp')) ext = '.webp'
              else if (contentType.includes('image/gif')) ext = '.gif'
              else if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) ext = '.mp3'
              else if (contentType.includes('audio/wav')) ext = '.wav'
              else if (contentType.includes('audio/ogg')) ext = '.ogg'
              else if (contentType.includes('audio/m4a')) ext = '.m4a'
              else {
                // Extract filename extension if present in multipart header
                const str = buffer.toString('binary', 0, Math.min(buffer.length, 2048))
                const filenameMatch = str.match(/filename="([^"]+)"/i)
                if (filenameMatch) {
                  const matchExt = path.extname(filenameMatch[1]).toLowerCase()
                  if (matchExt) ext = matchExt
                }
              }

              // Strip multipart headers if buffer contains binary data after CRLF CRLF
              let fileData = buffer
              const headerEndIdx = buffer.indexOf('\r\n\r\n')
              if (headerEndIdx !== -1) {
                const footerStartIdx = buffer.lastIndexOf('\r\n--')
                if (footerStartIdx > headerEndIdx + 4) {
                  fileData = buffer.slice(headerEndIdx + 4, footerStartIdx)
                } else {
                  fileData = buffer.slice(headerEndIdx + 4)
                }
              }

              const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
              const targetDir = path.join(process.cwd(), 'public', 'uploads', category, slug)
              
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true })
              }

              const filePath = path.join(targetDir, filename)
              fs.writeFileSync(filePath, fileData)

              const publicUrl = `/uploads/${category}/${slug}/${filename}`
              return res.status(200).json({ success: true, url: publicUrl })
            } catch (err) {
              console.error('Dev upload error:', err)
              return res.status(500).json({ error: 'Failed to save uploaded file locally' })
            }
          })
          return
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
            res.status(500).json({ error: err.message })
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
  },
})
