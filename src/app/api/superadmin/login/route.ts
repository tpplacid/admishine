import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/superadmin'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = process.env.SUPERADMIN_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: 'Super admin not configured' }, { status: 500 })
  }
  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
