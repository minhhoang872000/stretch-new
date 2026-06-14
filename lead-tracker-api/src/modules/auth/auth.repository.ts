import { pool } from '../../config/db'

export interface AdminRow {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: string
}

export const authRepository = {
  async findByEmail(email: string): Promise<AdminRow | null> {
    const { rows } = await pool.query<AdminRow>(
      'SELECT * FROM admins WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    )
    return rows[0] ?? null
  },
}
