import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is missing. Please set DATABASE_URL in environment variables.')
}

const pool = new pg.Pool({
  connectionString,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export default pool
