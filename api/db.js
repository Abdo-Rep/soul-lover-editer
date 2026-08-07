import pg from 'pg'

const connectionString = 'postgresql://postgres.main:SupabaseStrongPass_2026_ChangeThis@31.220.93.65:5432/postgres'

const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: false,
})

export async function query(text, params) {
  const client = await pool.connect()
  try {
    // Set schema search path so queries automatically resolve to the correct schema
    await client.query('SET search_path TO "old-romantic", "romantic-new-version", public;')
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

export default {
  query,
}
