import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHmac, timingSafeEqual } from 'crypto'

export const COOKIE_NAME = '__ct_sa'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// ── HMAC-signed session token ──────────────────────────────────────────────
// Token format: <timestamp>.<hmac_hex>
// Signed with the SUPERADMIN_PASSWORD as the HMAC key so tokens are
// invalidated automatically when the password is rotated.

export function createSessionToken(password: string): string {
  const ts = Date.now().toString(36)
  const sig = createHmac('sha256', password).update(ts).digest('hex')
  return `${ts}.${sig}`
}

export function verifySessionToken(token: string | undefined, password: string): boolean {
  if (!token || !password) return false
  const dot = token.indexOf('.')
  if (dot === -1) return false
  const ts = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!ts || !sig) return false

  // Check expiry
  const issued = parseInt(ts, 36)
  if (isNaN(issued) || Date.now() - issued > SESSION_TTL_MS) return false

  // Constant-time comparison
  try {
    const expected = createHmac('sha256', password).update(ts).digest('hex')
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function requireSuperAdmin() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const password = process.env.SUPERADMIN_PASSWORD
  if (!password || !verifySessionToken(token, password)) {
    redirect('/superadmin/login')
  }
}

export async function isSuperAdmin(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const password = process.env.SUPERADMIN_PASSWORD
  return !!password && verifySessionToken(token, password)
}
