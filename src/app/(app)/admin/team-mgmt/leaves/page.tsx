import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminLeavesClient } from '../../leaves/AdminLeavesClient'

export default async function TeamLeavesPage() {
  const employee = await requireRole(['ad'])
  const supabase = createAdminClient()
  const { data: orgEmps } = await supabase.from('employees').select('id').eq('org_id', employee.org_id)
  const empIds = (orgEmps || []).map(e => e.id)
  const { data: leaves } = await supabase.from('leaves').select('*, employee:employees!employee_id(id,name,role)').in('employee_id', empIds.length > 0 ? empIds : ['00000000-0000-0000-0000-000000000000']).order('created_at', { ascending: false })
  return <AdminLeavesClient admin={employee} leaves={leaves || []} />
}
