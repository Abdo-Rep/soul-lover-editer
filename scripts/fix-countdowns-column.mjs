import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'
const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to Postgres database')

    // 1. Alter date_love_confession to TEXT
    await client.query('ALTER TABLE public.sites ALTER COLUMN date_love_confession TYPE TEXT;')
    console.log('✅ Altered date_love_confession to TEXT')

    // 2. Add countdowns_json column if it doesn't exist
    await client.query('ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS countdowns_json TEXT DEFAULT \'[]\';')
    console.log('✅ Ensured countdowns_json column exists')

    console.log('🎉 Database migration complete for countdowns!')
  } catch (err) {
    console.error('❌ Migration Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
