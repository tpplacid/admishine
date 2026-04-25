import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { OfflineApprovalsClient } from './OfflineApprovalsClient'

export const revalidate = 30

export default async function OfflineApprovalsPage() {
  const employee = await requireRole(['ad'])
  const supabase = createAdminClient()

  const { data: approvals } = await supabase
    .from('offline_lead_approvals')
    .select(`
      *,
      lead:leads(id,name,phone,source,main_stage),
      submitter:employees!offline_lead_approvals_submitted_by_fkey(id,name,role)
    `)
    .eq('org_id', employee.org_id)
    .order('created_at', { ascending: false })

  return <OfflineApprovalsClient admin={employee} approvals={approvals || []} />
}
