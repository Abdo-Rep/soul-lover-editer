import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('❌ DATABASE_URL environment variable is required.')
}

const client = new pg.Client({ connectionString, ssl: false })

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL')

    // Create tables in public schema so they appear by default in Supabase Studio Table Editor
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        site_name VARCHAR(255) NOT NULL,
        visitor_password VARCHAR(255) NOT NULL,
        admin_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        language VARCHAR(10) DEFAULT 'ar',
        
        primary_color VARCHAR(50) DEFAULT '#fb7185',
        background_heart_color VARCHAR(50) DEFAULT '#be123c',
        heart_opacity NUMERIC DEFAULT 0.65,
        background_heart_char VARCHAR(10) DEFAULT '♥',
        push_heart_char VARCHAR(10) DEFAULT '♥',
        
        date_relationship_start VARCHAR(100) DEFAULT '',
        date_first_meeting VARCHAR(100) DEFAULT '',
        date_love_confession VARCHAR(100) DEFAULT '',
        
        music_file_name VARCHAR(255) DEFAULT 'romantic.mp3',
        music_title VARCHAR(255) DEFAULT 'أغنيتنا',
        music_src TEXT DEFAULT '',
        music_volume NUMERIC DEFAULT 0.35,
        
        login_eyebrow TEXT DEFAULT 'هدية من قلبي',
        login_title TEXT DEFAULT 'أهلاً يا حبيبتي',
        login_subtitle TEXT DEFAULT 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.',
        login_placeholder TEXT DEFAULT 'كلمة المرور السرية',
        login_password_label TEXT DEFAULT 'كلمة المرور',
        login_button TEXT DEFAULT 'افتحي قلبي',
        login_error TEXT DEFAULT 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.',
        login_footer TEXT DEFAULT 'صُنع بحب، لكِ وحدك',
        
        welcome_eyebrow TEXT DEFAULT 'وصلتِ إليه أخيراً',
        welcome_title TEXT DEFAULT 'مرحباً يا أجمل حب في حياتي',
        welcome_subtitle TEXT DEFAULT 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.',
        
        story_eyebrow TEXT DEFAULT 'A Love Story',
        story_title TEXT DEFAULT 'Our Story',
        story_first_meeting_label TEXT DEFAULT 'أول يوم التقينا فيه',
        story_first_meeting_description TEXT DEFAULT 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.',
        story_love_confession_label TEXT DEFAULT 'اليوم الذي قلت فيه "أحبك"',
        story_love_confession_message TEXT DEFAULT 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.',
        
        gallery_eyebrow TEXT DEFAULT 'Our Album',
        gallery_title TEXT DEFAULT 'Memories',
        
        final_eyebrow TEXT DEFAULT 'رسالة أخيرة',
        final_title TEXT DEFAULT 'للأبد ودائماً',
        final_text TEXT DEFAULT 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.'
      );
    `)
    console.log('✅ Table public.sites created!')

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.memories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
        tenant_slug VARCHAR(100) NOT NULL,
        image TEXT DEFAULT '',
        date VARCHAR(100) DEFAULT '',
        text TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Table public.memories created!')

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gallery_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
        tenant_slug VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        date VARCHAR(100) DEFAULT '',
        description TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Table public.gallery_items created!')

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
        tenant_slug VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Table public.wishlist_items created!')

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.super_admins (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table public.super_admins created!')

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_public_sites_slug ON public.sites(slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_public_memories_slug ON public.memories(tenant_slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_public_gallery_slug ON public.gallery_items(tenant_slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_public_wishlist_slug ON public.wishlist_items(tenant_slug);')

    // Copy any rows from "romantic-new-version" to "public" if present
    await client.query(`
      INSERT INTO public.sites SELECT * FROM "romantic-new-version".sites ON CONFLICT (slug) DO NOTHING;
      INSERT INTO public.super_admins SELECT * FROM "romantic-new-version".super_admins ON CONFLICT (email) DO NOTHING;
    `).catch((e) => console.warn('Sync notice:', e.message))

    console.log('🎉 Public schema tables setup complete!')

  } catch (err) {
    console.error('❌ Migration to public schema error:', err.message)
  } finally {
    await client.end()
  }
}

run()
