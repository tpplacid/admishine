import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Employee } from '@/types'
import { SavedReportsClient } from './SavedReportsClient'

interface SavedReport {
  id: string
  org_id: string
  created_by: string
  name: string
  config: {
    metric: 'leads' | 'activities' | 'sla_breaches'
    groupBy: string
    chartType: 'bar' | 'line' | 'pie'
    dateRange: 7 | 30 | 90
  }
  visible_to_team: boolean
  created_at: string
  creator?: { name: string }
}

export default async function SavedReportsPage() {
  const employee = await requireRole(['ad'])
  const supabase = await createClient()
  const orgId = employee.org_id

  const [{ data: reportsRaw }, { data: employeesRaw }] = await Promise.all([
    supabase
      .from('reports')
      .select('id, org_id, created_by, name, config, visible_to_team, created_at, creator:employees!reports_created_by_fkey(name)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false }),
    supabase
      .from('employees')
      .select('id, name, role, is_active')
      .eq('org_id', orgId)
      .eq('is_active', true),
  ])

  return (
    <SavedReportsClient
      reports={(reportsRaw || []) as unknown as SavedReport[]}
      employees={(employeesRaw || []) as unknown as Employee[]}
      orgId={orgId}
    />
  )
}
