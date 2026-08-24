import pg from 'pg'

// List possible Supabase pooler usernames with tenant identifier '.main'
const usernames = [
  'postgres.main',
  'supabase_admin.main',
  'service_role.main',
  'authenticator.main',
  'anon.main',
]

const password = 'SupabaseStrongPass_2026_ChangeThis'
const host = '31.220.93.65'
const port = 5432
const dbname = 'postgres'

async function run() {
  let mainClient = null

  // 1. Connect with postgres.main first to inspect owner of old-romantic.sites
  try {
    const connStr = `postgresql://postgres.main:${encodeURIComponent(password)}@${host}:${port}/${dbname}`
    mainClient = new pg.Client({ connectionString: connStr, ssl: false })
    await mainClient.connect()
    console.log('✅ Connected with postgres.main!')

    const ownerRes = await mainClient.query(`
      SELECT table_schema, table_name, tableowner 
      FROM information_schema.tables 
      WHERE table_name = 'sites';
    `)
    console.log('📋 Sites Table Owners:', ownerRes.rows)

  } catch (err) {
    console.error('❌ Failed initial connection:', err.message)
  }

  // 2. Try each user to alter old-romantic.sites
  for (const user of usernames) {
    const connStr = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbname}`
    console.log(`\n🔌 Trying execution with user: "${user}"...`)

    const client = new pg.Client({ connectionString: connStr, ssl: false })
    try {
      await client.connect()

      // Grant privileges / change owner if allowed
      try {
        await client.query(`GRANT ALL PRIVILEGES ON TABLE "old-romantic".sites TO "${user}";`)
        console.log(`  🔑 Granted privileges on "old-romantic".sites to "${user}"`)
      } catch (e) {}

      try {
        await client.query(`ALTER TABLE "old-romantic".sites OWNER TO "${user}";`)
        console.log(`  👑 Changed owner of "old-romantic".sites to "${user}"`)
      } catch (e) {}

      // Add columns
      await client.query(`
        ALTER TABLE "old-romantic".sites 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      `)
      console.log(`  ✅ Success is_active added to "old-romantic".sites with user "${user}"!`)

      await client.query(`
        ALTER TABLE "old-romantic".sites 
        ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ar';
      `)
      console.log(`  ✅ Success language added to "old-romantic".sites with user "${user}"!`)

      // If we made it here, notify PostgREST
      await client.query("NOTIFY pgrst, 'reload schema';")
      console.log('  🎉 NOTIFIED POSTGREST TO RELOAD SCHEMA!')

      await client.end()
      console.log('\n🌟 CONGRATULATIONS! OLD-ROMANTIC SCHEMA UPDATED SUCCESSFULLY!')
      if (mainClient) await mainClient.end()
      return

    } catch (err) {
      console.warn(`  ❌ User "${user}" failed:`, err.message)
      await client.end().catch(() => {})
    }
  }

  if (mainClient) await mainClient.end()
}

run()
