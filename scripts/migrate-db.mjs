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

    // 1. Create sites table with discrete relational columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        site_name VARCHAR(255) NOT NULL,
        visitor_password VARCHAR(255) NOT NULL,
        admin_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Appearance Settings
        primary_color VARCHAR(50) DEFAULT '#fb7185',
        background_heart_color VARCHAR(50) DEFAULT '#be123c',
        heart_opacity NUMERIC DEFAULT 0.65,
        background_heart_char VARCHAR(10) DEFAULT '♥',
        push_heart_char VARCHAR(10) DEFAULT '♥',
        
        -- Dates Settings
        date_relationship_start VARCHAR(100) DEFAULT '',
        date_first_meeting VARCHAR(100) DEFAULT '',
        date_love_confession VARCHAR(100) DEFAULT '',
        
        -- Music Settings
        music_file_name VARCHAR(255) DEFAULT 'romantic.mp3',
        music_title VARCHAR(255) DEFAULT 'أغنيتنا',
        music_src TEXT DEFAULT '',
        music_volume NUMERIC DEFAULT 0.35,
        
        -- Login Page Content
        login_eyebrow TEXT DEFAULT 'هدية من قلبي',
        login_title TEXT DEFAULT 'أهلاً يا حبيبتي',
        login_subtitle TEXT DEFAULT 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.',
        login_placeholder TEXT DEFAULT 'كلمة المرور السرية',
        login_password_label TEXT DEFAULT 'كلمة المرور',
        login_button TEXT DEFAULT 'افتحي قلبي',
        login_error TEXT DEFAULT 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.',
        login_footer TEXT DEFAULT 'صُنع بحب، لكِ وحدك',
        
        -- Welcome Section Content
        welcome_eyebrow TEXT DEFAULT 'وصلتِ إليه أخيراً',
        welcome_title TEXT DEFAULT 'مرحباً يا أجمل حب في حياتي',
        welcome_subtitle TEXT DEFAULT 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.',
        
        -- Story Section Content
        story_eyebrow TEXT DEFAULT 'A Love Story',
        story_title TEXT DEFAULT 'Our Story',
        story_first_meeting_label TEXT DEFAULT 'أول يوم التقينا فيه',
        story_first_meeting_description TEXT DEFAULT 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.',
        story_love_confession_label TEXT DEFAULT 'اليوم الذي قلت فيه "أحبك"',
        story_love_confession_message TEXT DEFAULT 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.',
        
        -- Gallery Section Content
        gallery_eyebrow TEXT DEFAULT 'Our Album',
        gallery_title TEXT DEFAULT 'Memories',
        
        -- Final Message Content
        final_eyebrow TEXT DEFAULT 'رسالة أخيرة',
        final_title TEXT DEFAULT 'للأبد ودائماً',
        final_text TEXT DEFAULT 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.'
      );
    `)
    console.log('✅ Table sites verified!')

    // 2. Create memories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".memories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES "romantic-new-version".sites(id) ON DELETE CASCADE,
        tenant_slug VARCHAR(100) NOT NULL,
        image TEXT DEFAULT '',
        date VARCHAR(100) DEFAULT '',
        text TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Table memories verified!')

    // 3. Create gallery_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".gallery_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES "romantic-new-version".sites(id) ON DELETE CASCADE,
        tenant_slug VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        date VARCHAR(100) DEFAULT '',
        description TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Table gallery_items verified!')

    // 4. Create wishlist_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES "romantic-new-version".sites(id) ON DELETE CASCADE,
        tenant_slug VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Table wishlist_items verified!')

    // 5. Create super_admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "romantic-new-version".super_admins (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table super_admins verified!')

    // Create indexes for performance and isolation
    await client.query('CREATE INDEX IF NOT EXISTS idx_sites_slug ON "romantic-new-version".sites(slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_memories_slug ON "romantic-new-version".memories(tenant_slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_gallery_slug ON "romantic-new-version".gallery_items(tenant_slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_wishlist_slug ON "romantic-new-version".wishlist_items(tenant_slug);')
    console.log('✅ Relational indexes verified!')

    // Seed Super Admin account WITH BCRYPT HASH
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPass) {
      const hash = await bcrypt.hash(adminPass.trim(), 10)
      await client.query(
        `INSERT INTO "romantic-new-version".super_admins (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO NOTHING;`,
        [adminEmail.toLowerCase(), hash],
      )
      console.log(`✅ Super Admin user (${adminEmail}) seeded/verified with bcrypt hashing!`)
    }

    const resSites = await client.query('SELECT COUNT(*) FROM "romantic-new-version".sites;')
    const resAdmins = await client.query('SELECT COUNT(*) FROM "romantic-new-version".super_admins;')
    console.log(`📊 DB Summary: ${resSites.rows[0].count} client sites, ${resAdmins.rows[0].count} super admin accounts.`)

  } catch (err) {
    console.error('❌ Migration Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
