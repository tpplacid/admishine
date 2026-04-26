import { NextRequest, NextResponse } from 'next/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId, name, email, password, role } = await req.json()

  if (!orgId || !name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

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
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .insert({ org_id: orgId, email, name, role })
    .select()
    .single()

  if (empError) {
    // Rollback auth user
    if (authUser.user) {
      await supabase.auth.admin.deleteUser(authUser.user.id)
    }
    return NextResponse.json({ error: empError.message }, { status: 400 })
  }

  return NextResponse.json({ employee })
}
