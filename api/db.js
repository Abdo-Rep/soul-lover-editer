import pg from 'pg'

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://romantic_user:Mohammedosha1%23@31.220.93.65:5433/romantic_saas'

const pool = new pg.Pool({
  connectionString,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export default pool
