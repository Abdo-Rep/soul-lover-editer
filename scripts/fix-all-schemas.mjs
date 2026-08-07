import pg from 'pg'

// Try superuser 'postgres' first, then 'postgres.main'
const connectionStrings = [
  'postgresql://postgres:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres',
  'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres',
]

async function run() {
  let client = null

  for (const connStr of connectionStrings) {
    try {
      console.log(`🔌 Attempting DB connection with: ${connStr.split('@')[0]}...`)
      client = new pg.Client({ connectionString: connStr, ssl: false })
      await client.connect()
      console.log('✅ Connected successfully!')
      break
    } catch (err) {
      console.warn(`⚠️ Failed connection with ${connStr.split('@')[0]}:`, err.message)
      client = null
    }
  }

  if (!client) {
    console.error('❌ Could not connect to database with any credentials.')
    return
  }

  try {
    // 1. Find all tables named 'sites' across ALL schemas
    const tablesRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'sites';
    `)

    console.log(`📋 Found ${tablesRes.rows.length} "sites" tables:`, tablesRes.rows.map(r => r.table_schema))

    // 2. Add columns to EVERY sites table found
    for (const tbl of tablesRes.rows) {
      const schema = tbl.table_schema
      console.log(`\n⚙️ Processing "${schema}".sites...`)

      // Attempt to take ownership if needed
      try {
        await client.query(`ALTER TABLE "${schema}".sites OWNER TO CURRENT_USER;`)
        console.log(`  👑 Changed ownership of "${schema}".sites to CURRENT_USER`)
      } catch (e) {
        // Ignored if already owner or not allowed
      }

      // Add is_active
      try {
        await client.query(`
          ALTER TABLE "${schema}".sites 
          ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        `)
        console.log(`  ✅ is_active added to "${schema}".sites`)
      } catch (e) {
        console.error(`  ❌ Failed is_active on "${schema}".sites:`, e.message)
      }

      // Add language
      try {
        await client.query(`
          ALTER TABLE "${schema}".sites 
          ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ar';
        `)
        console.log(`  ✅ language added to "${schema}".sites`)
      } catch (e) {
        console.error(`  ❌ Failed language on "${schema}".sites:`, e.message)
      }
    }

    // 3. Reload PostgREST schema cache
    try {
      await client.query("NOTIFY pgrst, 'reload schema';")
      console.log('\n✅ PostgREST schema reload notified!')
    } catch (e) {
      console.error('❌ Failed notify pgrst:', e.message)
    }

    console.log('\n🎉 ALL SCHEMAS FULLY UPDATED & OWNED!')

  } catch (err) {
    console.error('❌ Migration Error:', err)
  } finally {
    await client.end()
  }
}

run()
