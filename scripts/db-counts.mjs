import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to database!')

    const schemas = ['public', 'romantic-new-version', 'old-romantic']

    for (const schema of schemas) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM "${schema}".sites;`)
        const rowsRes = await client.query(`SELECT slug, created_at FROM "${schema}".sites LIMIT 10;`)
        console.log(`\n📌 Schema "${schema}" - Sites Count: ${res.rows[0].count}`)
        console.log('Rows:', rowsRes.rows)
      } catch (err) {
        console.error(`❌ Error querying "${schema}".sites:`, err.message)
      }
    }

  } catch (err) {
    console.error('❌ DB Error:', err)
  } finally {
    await client.end()
  }
}

run()
