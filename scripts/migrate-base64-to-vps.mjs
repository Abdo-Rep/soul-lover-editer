import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = process.env.DATABASE_URL
const UPLOADS_ROOT = process.env.UPLOADS_ROOT || path.join(__dirname, '../media-service/uploads')
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || 'https://media.soulove.app'

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required.')
  process.exit(1)
}

const client = new pg.Client({
  connectionString,
  ssl: false,
})

function saveBase64ToFile(base64Str, slug, category) {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:')) {
    return base64Str
  }

  try {
    const matches = base64Str.match(/^data:(image|audio)\/([a-zA-Z0-9+-]+);base64,(.+)$/)
    if (!matches) return base64Str

    const mediaType = matches[1]
    let ext = matches[2]
    const base64Data = matches[3]

    if (ext === 'jpeg') ext = 'jpg'
    if (ext === 'mpeg') ext = 'mp3'

    const targetDir = path.join(UPLOADS_ROOT, slug, category)
    fs.mkdirSync(targetDir, { recursive: true })

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const absolutePath = path.join(targetDir, filename)

    fs.writeFileSync(absolutePath, Buffer.from(base64Data, 'base64'))

    const publicUrl = `${MEDIA_BASE_URL.replace(/\/$/, '')}/uploads/${slug}/${category}/${filename}`
    console.log(`  └─ Migrated ${mediaType} (${(base64Data.length * 0.75 / 1024).toFixed(1)} KB) -> ${publicUrl}`)
    return publicUrl
  } catch (err) {
    console.error('Failed to convert Base64:', err.message)
    return base64Str
  }
}

async function runMigration() {
  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL for Base64 -> VPS Media Migration')

    const res = await client.query('SELECT slug, data FROM public.user_sites;')
    console.log(`📊 Found ${res.rows.length} client sites to check.`)

    let totalMigratedCount = 0

    for (const row of res.rows) {
      const slug = row.slug
      const data = row.data || {}
      let isModified = false

      // 1. Memories images
      if (Array.isArray(data.memories)) {
        data.memories = data.memories.map((item) => {
          if (item.image && item.image.startsWith('data:')) {
            const newUrl = saveBase64ToFile(item.image, slug, 'memories')
            if (newUrl !== item.image) {
              isModified = true
              totalMigratedCount++
            }
            return { ...item, image: newUrl }
          }
          return item
        })
      }

      // 2. Gallery items images
      if (Array.isArray(data.galleryItems)) {
        data.galleryItems = data.galleryItems.map((item) => {
          if (item.image && item.image.startsWith('data:')) {
            const newUrl = saveBase64ToFile(item.image, slug, 'gallery')
            if (newUrl !== item.image) {
              isModified = true
              totalMigratedCount++
            }
            return { ...item, image: newUrl }
          }
          return item
        })
      }

      // 3. Music tracks audio
      if (data.music && Array.isArray(data.music.tracks)) {
        data.music.tracks = data.music.tracks.map((track) => {
          if (track.src && track.src.startsWith('data:')) {
            const newUrl = saveBase64ToFile(track.src, slug, 'music')
            if (newUrl !== track.src) {
              isModified = true
              totalMigratedCount++
            }
            return { ...track, src: newUrl }
          }
          return track
        })
      }

      if (data.music && data.music.src && data.music.src.startsWith('data:')) {
        const newUrl = saveBase64ToFile(data.music.src, slug, 'music')
        if (newUrl !== data.music.src) {
          isModified = true
          totalMigratedCount++
        }
        data.music.src = newUrl
      }

      if (isModified) {
        await client.query('UPDATE public.user_sites SET data = $1, updated_at = now() WHERE slug = $2;', [
          JSON.stringify(data),
          slug,
        ])
        console.log(`✅ Site [${slug}] JSON updated with migrated media URLs!`)
      }
    }

    console.log(`🎉 Migration complete! Converted ${totalMigratedCount} Base64 files to VPS media files.`)
  } catch (err) {
    console.error('❌ Migration Error:', err)
  } finally {
    await client.end()
  }
}

runMigration()
