import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

async function checkAllTables() {
  const client = new pg.Client({ connectionString, ssl: false })
  try {
    await client.connect()
    
    const schemas = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `)
    
    console.log('\n=== ALL TABLES ACROSS ALL SCHEMAS ===')
    console.table(schemas.rows)
    
    await client.end()
  } catch (err) {
    console.error('Error:', err.message)
  }
}

checkAllTables()
