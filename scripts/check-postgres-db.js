import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

async function testPostgresDb() {
  const urlPostgres = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
  console.log('\n--- Checking Database "postgres" ---')
  const client = new pg.Client({ connectionString: urlPostgres, ssl: false })
  try {
    await client.connect()
    const tables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `)
    console.log('Tables in database "postgres" -> schema "public":')
    console.table(tables.rows)
    await client.end()
  } catch (err) {
    console.error('Error:', err.message)
  }
}

testPostgresDb()
