import { requireSuperAdmin } from '@/lib/superadmin'
import { createAdminClient } from '@/lib/supabase/admin'
import SuperAdminSupportClient from './SuperAdminSupportClient'

export const dynamic = 'force-dynamic'

export default async function SuperAdminSupportPage() {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  return <SuperAdminSupportClient initialTickets={tickets ?? []} />
}
