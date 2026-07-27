import pg from 'pg'

const connectionString = 'postgresql://romantic_user:Mohammedosha1%23@31.220.93.65:5433/romantic_saas'

const client = new pg.Client({
  connectionString,
  ssl: false,
})

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected successfully to Contabo PostgreSQL database: romantic_saas')

    // Query PostgreSQL version
    const resVer = await client.query('SELECT version();')
    console.log('📌 DB Version:', resVer.rows[0].version)

    // Query existing public tables
    const resTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)

    console.log('📊 Existing public tables count:', resTables.rows.length)
    if (resTables.rows.length === 0) {
      console.log('ℹ️ Database is EMPTY (no tables in public schema).')
    } else {
      console.log('📋 Table list:', resTables.rows.map((t) => t.table_name))
    }

  } catch (err) {
    console.error('❌ Connection/Query Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
