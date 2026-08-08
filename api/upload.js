import path from 'path'
import fs from 'fs'
import os from 'os'

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
    '.mpga': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.opus': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.webm': 'audio/webm',
    '.3gp': 'audio/3gpp',
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-category, x-slug, x-upload-id, x-chunk-index, x-total-chunks')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const category = (req.query.category || req.headers['x-category'] || 'gallery').replace(/[^a-z0-9_-]/gi, '')
  const slug = (req.query.slug || req.headers['x-slug'] || 'default').replace(/[^a-z0-9_-]/gi, '')
  const uploadId = (req.query.uploadId || req.headers['x-upload-id'] || '').replace(/[^a-z0-9_-]/gi, '')
  const chunkIndex = parseInt(req.query.chunkIndex || req.headers['x-chunk-index'] || '0', 10)
  const totalChunks = parseInt(req.query.totalChunks || req.headers['x-total-chunks'] || '1', 10)
  const queryFileName = req.query.fileName || ''

  try {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'الملف فارغ' })
    }

    let fileData = buffer

    // Handle chunked upload streaming to temporary storage
    if (uploadId && totalChunks > 1) {
      const tempFilePath = path.join(os.tmpdir(), `soulove-${uploadId}.bin`)
      if (chunkIndex === 0) {
        fs.writeFileSync(tempFilePath, buffer)
      } else {
        fs.appendFileSync(tempFilePath, buffer)
      }

      // If not the final chunk yet, acknowledge receipt and wait for remaining chunks
      if (chunkIndex < totalChunks - 1) {
        return res.status(200).json({ success: true, chunkReceived: chunkIndex })
      }

      // Final chunk received: read the complete assembled file
      fileData = fs.readFileSync(tempFilePath)
      try {
        fs.unlinkSync(tempFilePath)
      } catch {}
    }

    const contentType = req.headers['content-type'] || ''

    // Extract filename from multipart header or query params
    let ext = '.jpg'
    const bufferHead = buffer.slice(0, 2048).toString('binary')
    const filenameMatch = bufferHead.match(/filename="([^"]+)"/i)
    const originalName = queryFileName || (filenameMatch ? filenameMatch[1] : '')

    if (originalName) {
      const parsedExt = getExt(originalName)
      if (parsedExt) ext = parsedExt
    } else if (contentType.includes('image/png')) ext = '.png'
    else if (contentType.includes('image/webp')) ext = '.webp'
    else if (contentType.includes('audio/webm')) ext = '.webm'
    else if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) ext = '.mp3'
    else if (contentType.includes('audio/mp4') || contentType.includes('audio/m4a')) ext = '.m4a'
    else if (contentType.includes('audio/ogg')) ext = '.ogg'
    else if (contentType.includes('audio/wav')) ext = '.wav'

    // Clean multipart boundaries if not using raw octet-stream chunks
    if (!uploadId && contentType.includes('boundary='')) {
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

    const mime = getMime(ext)
    const timestamp = Date.now()
    const filename = `${category}-${timestamp}${ext}`
    const objectPath = `${slug}/${category}/${filename}`
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/site-media/${objectPath}`

    await ensureBucket()

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...storageHeaders,
        'Content-Type': mime,
        'x-upsert': 'true',
      },
      body: fileData,
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
}
