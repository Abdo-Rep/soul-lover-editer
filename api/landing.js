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
        notes TEXT,
        email TEXT,
        market TEXT DEFAULT 'eg',
        currency TEXT DEFAULT 'EGP'
      );
    `)

    // Safe column migrations in case table already exists
    await query(`
      ALTER TABLE landing_orders ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE landing_orders ADD COLUMN IF NOT EXISTS market TEXT DEFAULT 'eg';
      ALTER TABLE landing_orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EGP';
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

  const { action, id, market, lang } = req.query || {}
  const targetMarket = market || lang || 'eg'
  const configId = targetMarket === 'us' ? 'us' : 'main'

  try {
    // 1. GET Requests: Fetch Config and/or Orders
    if (req.method === 'GET') {
      if (action === 'orders') {
        const queryText = targetMarket === 'us'
          ? "SELECT * FROM landing_orders WHERE market = 'us' ORDER BY created_at DESC;"
          : 'SELECT * FROM landing_orders ORDER BY created_at DESC;'
        const result = await query(queryText)
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
            email: row.email || '',
            market: row.market || 'eg',
            currency: row.currency || (row.market === 'us' ? 'USD' : 'EGP'),
          }))
        )
      }

      // Fetch Full Landing Config (by market: 'main' for EG, 'us' for US)
      const configRes = await query('SELECT data FROM landing_config WHERE id = $1 LIMIT 1;', [configId])
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
        email: row.email || '',
        market: row.market || 'eg',
        currency: row.currency || (row.market === 'us' ? 'USD' : 'EGP'),
      }))

      return res.status(200).json({
        config: configData,
        orders: ordersData,
        market: targetMarket,
      })
    }

    // 2. POST Requests: Save Config OR Place New Order
    if (req.method === 'POST') {
      const body = req.body || {}

      // Place New Customer Order
      if (action === 'order' || body.action === 'order') {
        const orderId = body.id || Date.now().toString()
        const createdAt = body.createdAt || new Date().toISOString()
        const status = body.status || 'New'
        const orderMarket = body.market || targetMarket || 'eg'
        const orderCurrency = body.currency || (orderMarket === 'us' ? 'USD' : 'EGP')
        const orderEmail = body.email || ''

        await query(
          `
          INSERT INTO landing_orders (id, created_at, status, your_name, partner_name, phone, package, notes, email, market, currency)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            your_name = EXCLUDED.your_name,
            partner_name = EXCLUDED.partner_name,
            phone = EXCLUDED.phone,
            package = EXCLUDED.package,
            notes = EXCLUDED.notes,
            email = EXCLUDED.email,
            market = EXCLUDED.market,
            currency = EXCLUDED.currency;
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
            orderEmail,
            orderMarket,
            orderCurrency,
          ]
        )

        // 🚀 Auto-trigger Webhook (e.g. n8n, Make.com, WhatsApp Gateway) if configured
        try {
          const configRes = await query('SELECT data FROM landing_config WHERE id = $1 LIMIT 1;', [configId])
          const configData = configRes.rows.length > 0 ? configRes.rows[0].data : {}
          const webhookUrl = configData?.webhook?.url || body.webhookUrl

          if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http')) {
            const isUs = orderMarket === 'us'
            const formattedMsg = isUs
              ? `🎉 *New US Order on Soulove!* 💖\n\n👤 *Customer:* ${body.yourName || 'N/A'}\n👰 *Partner:* ${body.partnerName || 'N/A'}\n📧 *Email:* ${orderEmail || 'N/A'}\n📱 *Phone:* ${body.phone || 'N/A'}\n📦 *Package:* ${body.package || 'VIP Love Package ($19.99)'}\n⏰ *Date:* ${new Date(createdAt).toUTCString()}`
              : `🎉 *وصلك طلب جديد في Soulove!* 💖\n\n👤 *اسم الشاب:* ${body.yourName || 'غير محدد'}\n👰 *اسم البنت:* ${body.partnerName || 'غير محدد'}\n📱 *رقم الواتساب:* ${body.phone || 'غير محدد'}\n📦 *الباقة:* ${body.package || 'باقة الحب VIP'}\n⏰ *تاريخ الطلب:* ${new Date(createdAt).toLocaleString('ar-EG')}`

            const webhookPayload = {
              event: 'new_order',
              orderId,
              createdAt,
              status,
              market: orderMarket,
              currency: orderCurrency,
              email: orderEmail,
              yourName: body.yourName,
              partnerName: body.partnerName,
              phone: body.phone,
              package: body.package || (isUs ? 'VIP Love Package' : 'باقة الحب VIP'),
              notes: body.notes || '',
              whatsappFormattedMessage: formattedMsg,
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
            email: orderEmail,
            market: orderMarket,
            currency: orderCurrency,
          },
        })
      }

      // Save Landing Page Full Configuration (US or EG based on configId)
      const targetConfigId = body.market === 'us' || targetMarket === 'us' ? 'us' : 'main'
      await query(
        `
        INSERT INTO landing_config (id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW();
      `,
        [targetConfigId, JSON.stringify(body)]
      )

      return res.status(200).json({
        success: true,
        market: targetConfigId,
        message: `Config saved to Supabase (${targetConfigId}) successfully`,
      })
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
