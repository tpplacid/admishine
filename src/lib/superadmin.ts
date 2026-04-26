import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = '__ct_sa'

export async function requireSuperAdmin() {
  const jar = await cookies()
  const val = jar.get(COOKIE_NAME)?.value
  const expected = process.env.SUPERADMIN_PASSWORD
  if (!expected || val !== expected) {
    redirect('/superadmin/login')
  }
}

export async function isSuperAdmin(): Promise<boolean> {
  const jar = await cookies()
  const val = jar.get(COOKIE_NAME)?.value
  const expected = process.env.SUPERADMIN_PASSWORD
  return !!expected && val === expected
}

export { COOKIE_NAME }
