import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to PG!')

    // List all databases
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;')
    console.log('📋 Databases in cluster:', res.rows.map(r => r.datname))

  } catch (err) {
    console.error('❌ Error listing databases:', err)
  } finally {
    await client.end()
  }
}

run()
