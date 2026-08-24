import dotenv from 'dotenv'

dotenv.config()

const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

function decodeJWT(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return 'Invalid token parts'
    const payload = Buffer.from(parts[1], 'base64').toString('utf8')
    return JSON.parse(payload)
  } catch (e) {
    return 'Error decoding: ' + e.message
  }
}

console.log('Decoded JWT Payload:', decodeJWT(JWT_TOKEN))
