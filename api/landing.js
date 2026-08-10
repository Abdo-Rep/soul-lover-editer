import { query } from './db.js'

let tablesInitialized = false

async function initTables() {
  if (tablesInitialized) return
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS landing_config (
        id TEXT PRIMARY KEY DEFAULT 'main',
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS landing_orders (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'جديد',
        your_name TEXT,
        partner_name TEXT,
        phone TEXT,
        package TEXT,
        notes TEXT
      );
    `)
    tablesInitialized = true
  } catch (err) {
    console.error('Error initializing landing tables:', err)
  }
}

export default async function handler(req, res) {
  // CORS & No-Cache Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  await initTables()

  const { action, id } = req.query || {}

  try {
    // 1. GET Requests: Fetch Config and/or Orders
    if (req.method === 'GET') {
      if (action === 'orders') {
        const result = await query('SELECT * FROM landing_orders ORDER BY created_at DESC;')
        return res.status(200).json(
          result.rows.map((row) => ({
            id: row.id,
            createdAt: row.created_at,
            status: row.status,
            yourName: row.your_name,
            partnerName: row.partner_name,
            phone: row.phone,
            package: row.package,
            notes: row.notes,
          }))
        )
      }

      // Fetch Full Landing Config
      const configRes = await query("SELECT data FROM landing_config WHERE id = 'main' LIMIT 1;")
      const configData = configRes.rows.length > 0 ? configRes.rows[0].data : null

      // Also get orders
      const ordersRes = await query('SELECT * FROM landing_orders ORDER BY created_at DESC;')
      const ordersData = ordersRes.rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        status: row.status,
        yourName: row.your_name,
        partnerName: row.partner_name,
        phone: row.phone,
        package: row.package,
        notes: row.notes,
      }))

      return res.status(200).json({
        config: configData,
        orders: ordersData,
      })
    }

    // 2. POST Requests: Save Config OR Place New Order
    if (req.method === 'POST') {
      const body = req.body || {}

      // Place New Customer Order
      if (action === 'order' || body.action === 'order') {
        const orderId = body.id || Date.now().toString()
        const createdAt = body.createdAt || new Date().toISOString()
        const status = body.status || 'جديد'

        await query(
          `
          INSERT INTO landing_orders (id, created_at, status, your_name, partner_name, phone, package, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            your_name = EXCLUDED.your_name,
            partner_name = EXCLUDED.partner_name,
            phone = EXCLUDED.phone,
            package = EXCLUDED.package,
            notes = EXCLUDED.notes;
        `,
          [
            orderId,
            createdAt,
            status,
            body.yourName || '',
            body.partnerName || '',
            body.phone || '',
            body.package || '',
            body.notes || '',
          ]
        )

        // 🚀 Auto-trigger Webhook (e.g. n8n, Make.com, WhatsApp Gateway) if configured
        try {
          const configRes = await query("SELECT data FROM landing_config WHERE id = 'main' LIMIT 1;")
          const configData = configRes.rows.length > 0 ? configRes.rows[0].data : {}
          const webhookUrl = configData?.webhook?.url || body.webhookUrl

          if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http')) {
            const webhookPayload = {
              event: 'new_order',
              orderId,
              createdAt,
              status,
              yourName: body.yourName,
              partnerName: body.partnerName,
              phone: body.phone,
              package: body.package || 'باقة الحب VIP',
              notes: body.notes || '',
              whatsappFormattedMessage: `🎉 *وصلك طلب جديد في Soulove!* 💖\n\n👤 *اسم الشاب:* ${body.yourName || 'غير محدد'}\n👰 *اسم البنت:* ${body.partnerName || 'غير محدد'}\n📱 *رقم الواتساب:* ${body.phone || 'غير محدد'}\n📦 *الباقة:* ${body.package || 'باقة الحب VIP'}\n⏰ *تاريخ الطلب:* ${new Date(createdAt).toLocaleString('ar-EG')}`,
            }

            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookPayload),
            }).catch((err) => console.warn('Webhook trigger fetch warning:', err.message))
          }
        } catch (webhookErr) {
          console.warn('Webhook dispatch skipped:', webhookErr.message)
        }

        return res.status(200).json({
          success: true,
          order: {
            id: orderId,
            createdAt,
            status,
            yourName: body.yourName,
            partnerName: body.partnerName,
            phone: body.phone,
            package: body.package,
            notes: body.notes,
          },
        })
      }

      // Save Landing Page Full Configuration
      await query(
        `
        INSERT INTO landing_config (id, data, updated_at)
        VALUES ('main', $1, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW();
      `,
        [JSON.stringify(body)]
      )

      return res.status(200).json({ success: true, message: 'Config saved to Supabase / Postgres successfully' })
    }

    // 3. PATCH Request: Update Order Status
    if (req.method === 'PATCH') {
      const body = req.body || {}
      const targetId = id || body.id
      const newStatus = body.status || 'جديد'

      if (!targetId) {
        return res.status(400).json({ error: 'Order ID is required' })
      }

      await query('UPDATE landing_orders SET status = $1 WHERE id = $2;', [newStatus, targetId])
      return res.status(200).json({ success: true, id: targetId, status: newStatus })
    }

    // 4. DELETE Request: Delete Order
    if (req.method === 'DELETE') {
      const targetId = id || req.query.id
      if (!targetId) {
        return res.status(400).json({ error: 'Order ID is required' })
      }

      await query('DELETE FROM landing_orders WHERE id = $1;', [targetId])
      return res.status(200).json({ success: true, id: targetId })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Landing API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error', details: error.message })
  }
}
