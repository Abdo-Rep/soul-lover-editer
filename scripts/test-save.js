import pool from '../api/db.js'
import { saveRelationalContent, fetchCompleteSite } from '../api/modelHelper.js'

async function testSave() {
  try {
    const slug = 'test-site-2026'
    console.log('\n--- 1. Creating Site "test-site-2026" ---')
    await pool.query(`
      INSERT INTO sites (slug, site_name, visitor_password, admin_password)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO NOTHING;
    `, [slug, 'موقع تجريبي', 'soulove', 'soulove'])

    console.log('\n--- 2. Updating Site Content (PUT) ---')
    await saveRelationalContent(pool, slug, {
      siteName: 'حبيبتي مريم',
      appearance: { primaryColor: '#e11d48', backgroundHeartColor: '#9f1239' },
      galleryItems: [
        { url: '/uploads/gallery/test-site-2026/photo1.webp', description: 'أول صورة لنا' }
      ],
      wishlist: [
        { text: 'نسافر دبي سوا', completed: true }
      ]
    })

    console.log('\n--- 3. Re-fetching Site from DB ---')
    const result = await fetchCompleteSite(pool, slug)
    console.log('Site Name:', result.content.siteName)
    console.log('Primary Color:', result.content.appearance.primaryColor)
    console.log('Gallery Items:', result.content.galleryItems)
    console.log('Wishlist:', result.content.wishlist)

    console.log('\n✅ SAVE AND FETCH TEST PASSED SUCCESSFULLY!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Test Save Error:', err)
    process.exit(1)
  }
}

testSave()
