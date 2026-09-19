export const config = {
  api: {
    responseLimit: false,
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).json({ error: 'Method Not Allowed' })

  const filePath = req.query.path
  if (!filePath) return res.status(400).json({ error: 'Missing path' })

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/public/site-media/${filePath}`

  try {
    const upstreamHeaders = {}
    if (req.headers.range) {
      upstreamHeaders.range = req.headers.range
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: upstreamHeaders,
    })

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).json({ error: 'File not found' })
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const contentLength = upstream.headers.get('content-length')
    const contentRange = upstream.headers.get('content-range')
    const acceptRanges = upstream.headers.get('accept-ranges') || 'bytes'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Accept-Ranges', acceptRanges)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    if (contentLength) res.setHeader('Content-Length', contentLength)
    if (contentRange) res.setHeader('Content-Range', contentRange)

    if (req.method === 'HEAD') {
      return res.status(upstream.status).end()
    }

    const arrayBuf = await upstream.arrayBuffer()
    res.status(upstream.status).end(Buffer.from(arrayBuf))
  } catch (err) {
    console.error('Media proxy error:', err)
    return res.status(500).json({ error: 'Failed to fetch media' })
  }
}
