import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

const restHeaders = {
  'apikey': SECRET_KEY,
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json'
}

async function run() {
  try {
    console.log(`🔌 Fetching columns (slug, is_active, language) from REST API...`)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/sites?select=slug,is_active,language`, { headers: restHeaders })
    if (res.ok) {
      const data = await res.json()
      console.log('✅ Success! Returned sites with columns:', data)
    } else {
      console.log(`❌ Failed: ${res.status} - ${await res.text()}`)
    }
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
}

run()
