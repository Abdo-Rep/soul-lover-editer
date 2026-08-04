export const config = {
  api: {
    responseLimit: false,
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const filePath = req.query.path
  if (!filePath) return res.status(400).json({ error: 'Missing path' })

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/public/site-media/${filePath}`

  try {
    const upstream = await fetch(targetUrl)
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'File not found' })
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const contentLength = upstream.headers.get('content-length')

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    if (contentLength) res.setHeader('Content-Length', contentLength)

    const arrayBuf = await upstream.arrayBuffer()
    res.status(200).end(Buffer.from(arrayBuf))
  } catch (err) {
    console.error('Media proxy error:', err)
    return res.status(500).json({ error: 'Failed to fetch media' })
  }
}
