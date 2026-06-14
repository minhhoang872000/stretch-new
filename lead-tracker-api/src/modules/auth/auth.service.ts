import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../../config/env'

// Password hash is computed once at startup to avoid rehashing on every login
let _adminHash: string | null = null
async function getAdminHash(): Promise<string> {
  if (!_adminHash) {
    _adminHash = await bcrypt.hash(env.admin.password, 12)
  }
  return _adminHash
}

export const authService = {
  async login(email: string, password: string) {
    const emailMatch = email.toLowerCase().trim() === env.admin.email
    if (!emailMatch) {
      throw Object.assign(new Error('INVALID_CREDENTIALS'), { code: 'INVALID_CREDENTIALS' })
    }

    const hash = await getAdminHash()
    const valid = await bcrypt.compare(password, hash)
    if (!valid) {
      throw Object.assign(new Error('INVALID_CREDENTIALS'), { code: 'INVALID_CREDENTIALS' })
    }

    const token = jwt.sign(
      { id: 'admin-1', email: env.admin.email, name: env.admin.name, role: 'admin' },
      env.jwtSecret,
      { expiresIn: '7d' }
    )

    return {
      token,
      admin: { id: 'admin-1', email: env.admin.email, name: env.admin.name, role: 'admin' },
    }
  },

  verifyToken(token: string): { id: string; email: string; name: string; role: string } {
    return jwt.verify(token, env.jwtSecret) as any
  },
}
