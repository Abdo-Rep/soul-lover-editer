import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Add is_active column if not exists
    await client.query(`
      ALTER TABLE public.sites 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `)
    console.log('✅ Column is_active added/verified!')

    // Add language column if not exists
    await client.query(`
      ALTER TABLE public.sites 
      ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ar';
    `)
    console.log('✅ Column language added/verified!')

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
