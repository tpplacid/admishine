import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Employee } from '@/types'
import { ReportBuilderClient } from './ReportBuilderClient'

export default async function CreateReportPage() {
  const employee = await requireRole(['ad'])
  const supabase = await createClient()

  const { data: employeesRaw } = await supabase
    .from('employees')
    .select('id, name, role, is_active')
    .eq('org_id', employee.org_id)
    .eq('is_active', true)

  return (
    <ReportBuilderClient
      orgId={employee.org_id}
      employeeId={employee.id}
      employees={(employeesRaw || []) as unknown as Employee[]}
    />
  )
}
