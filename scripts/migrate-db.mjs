import pg from 'pg'

const connectionString = 'postgresql://romantic_user:Mohammedosha1%23@31.220.93.65:5433/romantic_saas'

const client = new pg.Client({
  connectionString,
  ssl: false,
})

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to Contabo PostgreSQL')

    // Create user_sites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_sites (
        slug TEXT PRIMARY KEY,
        site_password TEXT NOT NULL DEFAULT 'soulove',
        admin_password TEXT NOT NULL DEFAULT '',
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    console.log('✅ Table user_sites created or verified successfully!')

    // Insert super admin master config if needed or test row
    const res = await client.query('SELECT COUNT(*) FROM public.user_sites;')
    console.log(`📊 Current user_sites row count: ${res.rows[0].count}`)

  } catch (err) {
    console.error('❌ Migration Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
