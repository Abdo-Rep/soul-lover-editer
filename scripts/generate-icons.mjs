import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createCRC32Table() {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c
  }
  return table
}

const crcTable = createCRC32Table()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const len = data.length
  const buf = Buffer.alloc(8 + len + 4)
  buf.writeUInt32BE(len, 0)
  buf.write(type, 4, 4, 'ascii')
  data.copy(buf, 8)
  const crcBuf = buf.subarray(4, 8 + len)
  const calcCrc = crc32(crcBuf)
  buf.writeUInt32BE(calcCrc, 8 + len)
  return buf
}

function isInsideHeart(normX, normY) {
  const x = (normX - 0.5) * 2.4
  const y = -(normY - 0.52) * 2.4
  const a = x * x + y * y - 0.75
  return a * a * a - x * x * y * y * y <= 0
}

function generateHeartPNG(size) {
  const width = size
  const height = size

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const ihdrChunk = makeChunk('IHDR', ihdr)
  const rawData = Buffer.alloc(height * (1 + width * 4))
  let offset = 0

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0
    const normY = y / height
    for (let x = 0; x < width; x++) {
      const normX = x / width

      if (isInsideHeart(normX, normY)) {
        // Red heart (#e11d48)
        rawData[offset++] = 0xe1
        rawData[offset++] = 0x1d
        rawData[offset++] = 0x48
        rawData[offset++] = 0xff
      } else {
        // Soft background (#fff1f2)
        rawData[offset++] = 0xff
        rawData[offset++] = 0xf1
        rawData[offset++] = 0xf2
        rawData[offset++] = 0xff
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 })
  const idatChunk = makeChunk('IDAT', compressedData)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk])
}

const outDir = path.resolve(__dirname, '../public')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generateHeartPNG(192))
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generateHeartPNG(512))
fs.writeFileSync(path.join(outDir, 'maskable-512x512.png'), generateHeartPNG(512))
console.log('✓ Successfully generated pwa-192x192.png, pwa-512x512.png, and maskable-512x512.png in public/')
