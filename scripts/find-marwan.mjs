import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to database!')

    // 1. List all schemas
    const schemasRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') 
        AND schema_name NOT LIKE 'pg_temp_%' 
        AND schema_name NOT LIKE 'pg_toast_temp_%';
    `)

    console.log('📋 Schemas to search:', schemasRes.rows.map(r => r.schema_name))

    // 2. Search for "marwan-mayseh" in all tables named "sites" across all schemas
    for (const row of schemasRes.rows) {
      const schema = row.schema_name
      try {
        // Check if "sites" table exists in this schema
        const tableCheck = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = 'sites';
        `, [schema])

        if (tableCheck.rows.length > 0) {
          const sitesRes = await client.query(`SELECT slug FROM "${schema}".sites;`)
          const slugs = sitesRes.rows.map(r => r.slug)
          console.log(`🔍 Schema "${schema}" contains sites:`, slugs)
        }
      } catch (err) {
        // Ignore schema permission errors
      }
    }

  } catch (err) {
    console.error('❌ DB Error:', err)
  } finally {
    await client.end()
  }
}

run()
