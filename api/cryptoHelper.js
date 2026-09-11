import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'soulove-super-secret-jwt-2026'

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

const CANDIDATE_SECRETS = Array.from(
  new Set([
    process.env.JWT_SECRET,
    'soulove-super-secret-jwt-2026',
    'soulove-jwt-secret-key-2026',
  ].filter(Boolean))
)

// Precompute keys once at module load time to prevent blocking event loop on scryptSync
const PRECOMPUTED_KEYS = CANDIDATE_SECRETS.map((secret) =>
  crypto.scryptSync(secret, 'salt-romantic-key', 32)
)

const PRIMARY_KEY = PRECOMPUTED_KEYS[0] || crypto.scryptSync(JWT_SECRET, 'salt-romantic-key', 32)

export function encrypt(text) {
  if (!text) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, PRIMARY_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `enc:${iv.toString('hex')}:${encrypted}`
}

export function decrypt(text) {
  if (!text) return ''
  if (!text.startsWith('enc:')) {
    return text // return as is if legacy plain text or bcrypt hash
  }

  const parts = text.split(':')
  if (parts.length < 3) return text

  try {
    const iv = Buffer.from(parts[1], 'hex')
    const encryptedText = Buffer.from(parts[2], 'hex')

    for (const key of PRECOMPUTED_KEYS) {
      try {
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv)
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        if (decrypted) {
          return decrypted
        }
      } catch {
        // Try next precomputed candidate key
      }
    }
  } catch {
    // Malformed hex or parsing issue
  }

  return text
}

