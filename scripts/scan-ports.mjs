import pg from 'pg'

const ports = [5432, 54321, 54322, 6543]
const host = '31.220.93.65'
const password = 'SupabaseStrongPass_2026_ChangeThis'

async function testPort(port) {
  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@${host}:${port}/postgres`
  const client = new pg.Client({ connectionString, ssl: false })
  
  try {
    console.log(`🔌 Testing port ${port}...`)
    await client.connect()
    console.log(`✅ SUCCESS! Connected to database on port ${port}!`)
    const res = await client.query('SELECT slug FROM sites LIMIT 5;')
    console.log(`  Sites found:`, res.rows)
    return true
  } catch (err) {
    console.log(`❌ Failed on port ${port}:`, err.message)
    return false
  } finally {
    await client.end().catch(() => {})
  }
}

async function run() {
  for (const port of ports) {
    const ok = await testPort(port)
    if (ok) {
      console.log(`🎉 Found correct DB port: ${port}`)
      break
    }
  }
}

run()
