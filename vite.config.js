import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitesHandler from './api/sites.js'
import superAdminHandler from './api/super-admin.js'

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

        if (url.pathname !== '/api/sites' && url.pathname !== '/api/super-admin') {
          return next()
        }

        // Attach res helpers if missing in Node http response
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

        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          if (body) {
            try {
              req.body = JSON.parse(body)
            } catch (e) {}
          }

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
        })
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
