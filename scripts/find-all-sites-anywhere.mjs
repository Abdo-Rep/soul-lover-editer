import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to database!')

    // Find all tables named "sites" in any schema
    const tablesRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'sites';
    `)

    console.log('📋 Found sites tables:', tablesRes.rows)

    for (const r of tablesRes.rows) {
      const schema = r.table_schema
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${schema}".sites;`)
        const rowsRes = await client.query(`SELECT slug, created_at FROM "${schema}".sites LIMIT 10;`)
        console.log(`✅ Schema "${schema}" - Count: ${countRes.rows[0].count}`)
        console.log('Rows:', rowsRes.rows)
      } catch (err) {
        console.log(`❌ Failed to query "${schema}".sites:`, err.message)
      }
    }

  } catch (err) {
    console.error('❌ DB Error:', err)
  } finally {
    await client.end()
  }
}

run()
