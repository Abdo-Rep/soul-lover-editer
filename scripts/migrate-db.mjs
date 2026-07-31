import pg from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('❌ DATABASE_URL environment variable is required.')
}

const client = new pg.Client({
  connectionString,
  ssl: false,
})

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to Supabase PostgreSQL')

    // 0. Create schema and set search path
    await client.query('CREATE SCHEMA IF NOT EXISTS "romantic-new-version";')
    await client.query('SET search_path TO "romantic-new-version", public;')
    console.log('✅ Schema "romantic-new-version" verified!')

    // 1. Create user_sites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".user_sites (
        slug TEXT PRIMARY KEY,
        site_password TEXT NOT NULL DEFAULT 'soulove',
        admin_password TEXT NOT NULL DEFAULT 'soulove',
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table user_sites verified!')

    // 2. Create super_admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".super_admins (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table super_admins verified!')

    // 3. Seed Super Admin account WITH BCRYPT HASH ONLY IF NOT ALREADY IN DATABASE
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPass) {
      // Hash the password for protection
      const hash = await bcrypt.hash(adminPass.trim(), 10)
      await client.query(
        `INSERT INTO "romantic-new-version".super_admins (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO NOTHING;`,
        [adminEmail.toLowerCase(), hash],
      )
      console.log(`✅ Super Admin user (${adminEmail}) seeded/verified with bcrypt hashing!`)
    } else {
      console.log('ℹ️ ADMIN_EMAIL or ADMIN_PASSWORD env not provided; skipping.')
    }

    const resSites = await client.query('SELECT COUNT(*) FROM "romantic-new-version".user_sites;')
    const resAdmins = await client.query('SELECT COUNT(*) FROM "romantic-new-version".super_admins;')
    console.log(`📊 DB Summary: ${resSites.rows[0].count} client sites, ${resAdmins.rows[0].count} super admin accounts.`)

  } catch (err) {
    console.error('❌ Migration Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
