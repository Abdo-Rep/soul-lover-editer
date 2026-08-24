import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.log('ℹ️ DATABASE_URL environment variable not provided; skipping local script execution.')
  process.exit(0)
}

const client = new pg.Client({
  connectionString,
  ssl: false,
})

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to Contabo PostgreSQL')

    const delRes = await client.query(
      "DELETE FROM public.user_sites WHERE slug IN ('soso', 'demo-love');",
    )
    console.log(`🗑️ Deleted ${delRes.rowCount} mock site(s) ('soso', 'demo-love').`)

    const resSites = await client.query('SELECT slug, created_at FROM public.user_sites;')
    console.log('📋 Remaining sites in DB:', resSites.rows)

  } catch (err) {
    console.error('❌ Error cleaning mock sites:', err.message)
  } finally {
    await client.end()
  }
}

run()
