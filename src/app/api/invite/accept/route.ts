import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { token, name, email, password } = await req.json()

  if (!token || !name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch invite
  const { data: invite } = await supabase
    .from('org_invites')
    .select('*')
    .eq('token', token)
    .single()

  if (!invite) {
    return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
  }
  if (invite.used_at) {
    return NextResponse.json({ error: 'This invite has already been used' }, { status: 400 })
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite has expired' }, { status: 400 })
  }

  // Create Supabase auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Create employee record
  const { error: empError } = await supabase.from('employees').insert({
    org_id: invite.org_id,
    email,
    name,
    role: invite.role,
  })

  if (empError) {
    // Rollback auth user
    if (authUser.user) {
      await supabase.auth.admin.deleteUser(authUser.user.id)
    }
    return NextResponse.json({ error: empError.message }, { status: 400 })
  }

  // Mark invite as used
  await supabase
    .from('org_invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)

  return NextResponse.json({ ok: true })
}
