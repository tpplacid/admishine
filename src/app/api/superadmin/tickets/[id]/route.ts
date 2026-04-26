import { NextRequest, NextResponse } from 'next/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status, admin_notes } = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, admin_notes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ticket: data })
}
