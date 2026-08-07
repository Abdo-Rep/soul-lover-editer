import pg from 'pg'

const databases = ['postgres', 'old-romantic', 'romantic-new-version']

async function run() {
  for (const db of databases) {
    const connectionString = `postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/${db}`
    const client = new pg.Client({ connectionString, ssl: false })

    try {
      await client.connect()
      console.log(`\n✅ Connected to database: "${db}"`)

      // List schemas in this database
      const schemasRes = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') 
          AND schema_name NOT LIKE 'pg_temp_%' 
          AND schema_name NOT LIKE 'pg_toast_temp_%';
      `)
      console.log(`📋 Schemas in "${db}":`, schemasRes.rows.map(r => r.schema_name))

      // Check "sites" table in "public" or other schemas of this database
      for (const row of schemasRes.rows) {
        const schema = row.schema_name
        try {
          const res = await client.query(`SELECT COUNT(*) FROM "${schema}".sites;`)
          const rowsRes = await client.query(`SELECT slug, visitor_password, created_at FROM "${schema}".sites LIMIT 10;`)
          console.log(`  📌 Table "${schema}".sites - Count: ${res.rows[0].count}`)
          console.log('  Rows:', rowsRes.rows)
        } catch (e) {
          // ignore
        }
      }

    } catch (err) {
      console.error(`❌ Error connecting to "${db}":`, err.message)
    } finally {
      await client.end().catch(() => {})
    }
  }
}

run()
