import pg from 'pg'

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
    console.log('✅ Connected to Contabo PostgreSQL')

    // 1. Create user_sites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_sites (
        slug TEXT PRIMARY KEY,
        site_password TEXT NOT NULL DEFAULT 'soulove',
        admin_password TEXT NOT NULL DEFAULT 'soulove',
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table public.user_sites verified!')

    // 2. Create super_admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.super_admins (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table public.super_admins verified!')

    // 3. Seed Super Admin account ONLY if environment variables are provided
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPass) {
      await client.query(
        `INSERT INTO public.super_admins (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`,
        [adminEmail.toLowerCase(), adminPass],
      )
      console.log(`✅ Super Admin user (${adminEmail}) seeded in Database successfully!`)
    } else {
      console.log('ℹ️ ADMIN_EMAIL or ADMIN_PASSWORD env not provided; skipping seeding.')
    }

    const resSites = await client.query('SELECT COUNT(*) FROM public.user_sites;')
    const resAdmins = await client.query('SELECT COUNT(*) FROM public.super_admins;')
    console.log(`📊 DB Summary: ${resSites.rows[0].count} client sites, ${resAdmins.rows[0].count} super admin accounts.`)

  } catch (err) {
    console.error('❌ Migration Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
