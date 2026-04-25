import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const employee = await requireAuth()
  const supabase = await createClient()

  // Fetch leads based on role
  let query = supabase
    .from('leads')
    .select('*, owner:employees!leads_owner_id_fkey(id,name,role), reporting_manager:employees!leads_reporting_manager_id_fkey(id,name)')
    .order('updated_at', { ascending: false })

  if (employee.role === 'ad') {
    // AD sees all
  } else if (employee.role === 'tl') {
    query = query.or(`owner_id.eq.${employee.id},reporting_manager_id.eq.${employee.id}`)
  } else {
    query = query.eq('owner_id', employee.id)
  }

  const [{ data: leads }, { data: approvals }] = await Promise.all([
    query.limit(200),
    supabase
      .from('offline_lead_approvals')
      .select('lead_id, status')
      .eq('submitted_by', employee.id),
  ])

  // Map lead_id → approval status for offline/referral leads
  const approvalMap: Record<string, string> = {}
  for (const a of approvals || []) approvalMap[a.lead_id] = a.status

  // Stats: exclude rejected offline leads
  const visibleLeads = (leads || []).filter(l =>
    l.source === 'meta' || l.approved || approvalMap[l.id] !== 'rejected'
  )

  const stats = {
    total: visibleLeads.length,
    hot: visibleLeads.filter(l => l.main_stage === 'C').length,
    followup: visibleLeads.filter(l => l.main_stage === 'B').length,
    closed: visibleLeads.filter(l => l.main_stage === 'F').length,
    totalPayments: visibleLeads.reduce((sum, l) =>
      sum + (l.application_fees || 0) + (l.booking_fees || 0) + (l.tuition_fees || 0), 0),
  }

  return <DashboardClient employee={employee} leads={leads || []} approvalMap={approvalMap} stats={stats} />
}
