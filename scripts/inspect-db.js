import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

async function inspect() {
  console.log('Connecting to DATABASE_URL:', connectionString)
  const client = new pg.Client({ connectionString, ssl: false })
  try {
    await client.connect()
    await client.query('SET search_path TO "romantic-new-version", public;')
    
    console.log('\n=== CURRENT SCHEMA: "romantic-new-version" ===')
    
    // 1. Check sites
    const sites = await client.query('SELECT id, slug, site_name, visitor_password, admin_password, created_at, updated_at FROM sites;')
    console.log(`\n📌 Sites Table Count: ${sites.rows.length}`)
    if (sites.rows.length > 0) {
      console.table(sites.rows)
    } else {
      console.log('No sites stored yet.')
    }

    // 2. Check memories
    const memories = await client.query('SELECT * FROM memories;')
    console.log(`\n📌 Memories Table Count: ${memories.rows.length}`)
    if (memories.rows.length > 0) {
      console.table(memories.rows)
    }

    // 3. Check gallery_items
    const gallery = await client.query('SELECT * FROM gallery_items;')
    console.log(`\n📌 Gallery Items Table Count: ${gallery.rows.length}`)
    if (gallery.rows.length > 0) {
      console.table(gallery.rows)
    }

    // 4. Check wishlist_items
    const wishlist = await client.query('SELECT * FROM wishlist_items;')
    console.log(`\n📌 Wishlist Items Table Count: ${wishlist.rows.length}`)
    if (wishlist.rows.length > 0) {
      console.table(wishlist.rows)
    }

    // 5. Check super_admins
    const admins = await client.query('SELECT email, password_hash, created_at FROM super_admins;')
    console.log(`\n📌 Super Admins Table Count: ${admins.rows.length}`)
    if (admins.rows.length > 0) {
      console.table(admins.rows)
    }

    await client.end()
  } catch (err) {
    console.error('Inspect DB error:', err.message)
  }
}

inspect()
