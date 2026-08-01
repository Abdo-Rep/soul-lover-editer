import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

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

pool.on('connect', (client) => {
  client.query('SET search_path TO public, "romantic-new-version"')
})

export default pool
