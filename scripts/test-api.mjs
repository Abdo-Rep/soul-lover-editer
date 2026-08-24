import superAdminHandler from '../api/super-admin.js'
import sitesHandler from '../api/sites.js'

function createMockReqRes(method, query = {}, body = {}, headers = {}) {
  const req = {
    method,
    query,
    body,
    headers,
  }

  let statusCode = 200
  let responseData = null

  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code
      return res
    },
    json: (data) => {
      responseData = data
      return res
    },
    end: () => res,
  }

  return { req, res, getResult: () => ({ statusCode, responseData }) }
}

async function testSaaS() {
  const adminPass = process.env.ADMIN_PASSWORD || 'test-pass'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@saalove.com'

  console.log('🧪 Testing SaaS Super Admin & Sites API...')

  // 1. Create a test site 'demo-love'
  const createMock = createMockReqRes(
    'POST',
    {},
    {
      slug: 'demo-love',
      sitePassword: 'soulove',
      adminPassword: 'soulove',
    },
    {
      authorization: `Bearer ${adminPass}`,
      'x-admin-email': adminEmail,
    },
  )

  await superAdminHandler(createMock.req, createMock.res)
  const createResult = createMock.getResult()
  console.log('✨ Create Site Result:', createResult.statusCode, createResult.responseData)

  // 2. Fetch site data for 'demo-love'
  const fetchMock = createMockReqRes('GET', { slug: 'demo-love' })
  await sitesHandler(fetchMock.req, fetchMock.res)
  const fetchResult = fetchMock.getResult()
  console.log('📖 Fetch Site Result:', fetchResult.statusCode, 'siteName:', fetchResult.responseData?.data?.siteName)
}

testSaaS()
