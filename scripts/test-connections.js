import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection(url, name) {
  console.log(`\n--- Testing ${name} ---`)
  console.log('URL:', url)
  const client = new pg.Client({ connectionString: url, ssl: false })
  try {
    await client.connect()
    console.log(`✅ Connected successfully to ${name}!`)
    const res = await client.query('SELECT current_database(), current_schema(), version();')
    console.log('Database Info:', res.rows[0])
    
    // Test querying sites table
    const sitesRes = await client.query('SELECT id, slug, site_name FROM public.sites;')
    console.log(`✅ Table public.sites queried. Count: ${sitesRes.rows.length}`)
    
    await client.end()
  } catch (err) {
    console.error(`❌ Connection failed for ${name}:`, err.message)
  }
}

async function run() {
  const url6543 = process.env.DATABASE_URL
  const url5432 = url6543 ? url6543.replace(':6543/', ':5432/').replace('?pgbouncer=true&connection_limit=1', '') : ''
  
  await testConnection(url6543, 'Port 6543 (PgBouncer)')
  if (url5432) {
    await testConnection(url5432, 'Port 5432 (Direct Postgres)')
  }
}

run()
