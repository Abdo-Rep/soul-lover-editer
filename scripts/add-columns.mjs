import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Add is_active column if not exists in public schema
    await client.query(`
      ALTER TABLE public.sites 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `)
    console.log('✅ Column is_active added/verified in public schema!')

    // Add language column if not exists in public schema
    await client.query(`
      ALTER TABLE public.sites 
      ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ar';
    `)
    console.log('✅ Column language added/verified in public schema!')

    // Add columns to "romantic-new-version" schema if exists
    try {
      await client.query(`
        ALTER TABLE "romantic-new-version".sites 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      `)
      console.log('✅ Column is_active added/verified in "romantic-new-version" schema!')
    } catch (e) {
      console.log('ℹ️ "romantic-new-version".sites schema/table might not exist, skipping:', e.message)
    }

    try {
      await client.query(`
        ALTER TABLE "romantic-new-version".sites 
        ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ar';
      `)
      console.log('✅ Column language added/verified in "romantic-new-version" schema!')
    } catch (e) {
      console.log('ℹ️ "romantic-new-version".sites schema/table might not exist, skipping:', e.message)
    }

    // Reload PostgREST schema cache so Supabase API sees the new columns
    await client.query("NOTIFY pgrst, 'reload schema';")
    console.log('✅ PostgREST schema reload triggered!')

    // Check columns
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sites';
    `)
    console.log('📋 Columns in sites table:', res.rows)

  } catch (err) {
    console.error('❌ Error altering table:', err)
  } finally {
    await client.end()
  }
}

run()
