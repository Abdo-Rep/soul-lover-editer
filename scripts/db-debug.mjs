import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to PG database!')

    // 1. Show all schemas in the database
    const schemasRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata;
    `)
    console.log('📋 Database Schemas:', schemasRes.rows.map(r => r.schema_name))

    // 2. Find all tables named 'sites' across all schemas
    const tablesRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'sites';
    `)
    console.log('📋 Found "sites" tables in schemas:', tablesRes.rows)

    // 3. Print columns for each sites table found
    for (const tbl of tablesRes.rows) {
      const colsRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position;
      `, [tbl.table_schema, tbl.table_name])
      console.log(`\n📌 Columns in ${tbl.table_schema}.${tbl.table_name}:`)
      console.table(colsRes.rows.map(r => ({ Column: r.column_name, Type: r.data_type })))
    }

  } catch (err) {
    console.error('❌ Error during db debug:', err)
  } finally {
    await client.end()
  }
}

run()
