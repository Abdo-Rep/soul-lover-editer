import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'soulove-jwt-secret-key-2026'

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = crypto.scryptSync(JWT_SECRET, 'salt-romantic-key', 32)
const IV_LENGTH = 16

export function encrypt(text) {
  if (!text) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `enc:${iv.toString('hex')}:${encrypted}`
}

export function decrypt(text) {
  if (!text) return ''
  if (!text.startsWith('enc:')) {
    return text // return as is if legacy plain text or bcrypt hash
  }
  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts[1], 'hex')
    const encryptedText = Buffer.from(parts[2], 'hex')
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err) {
    console.error('[Decryption Failed]:', err.message)
    return text
  }
}
