import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('❌ DATABASE_URL environment variable is required.')
}

const client = new pg.Client({
  connectionString,
  ssl: false,
})

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected successfully to Contabo PostgreSQL database')

    const resVer = await client.query('SELECT version();')
    console.log('📌 DB Version:', resVer.rows[0].version)

    const resTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)

    console.log('📊 Existing public tables count:', resTables.rows.length)
    console.log('📋 Table list:', resTables.rows.map((t) => t.table_name))

  } catch (err) {
    console.error('❌ Connection/Query Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
