import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_NAME, createSessionToken } from '@/lib/superadmin'

// TEMPORARY — remove after debugging
export async function GET(req: NextRequest) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const pw = process.env.SUPERADMIN_PASSWORD

  const expected = pw ? createSessionToken(pw) : null

  return NextResponse.json({
    cookie_present: !!token,
    cookie_length: token?.length ?? 0,
    cookie_matches: token && expected ? token === expected : false,
    expected_length: expected?.length ?? 0,
    env_set: !!pw,
  })
}
