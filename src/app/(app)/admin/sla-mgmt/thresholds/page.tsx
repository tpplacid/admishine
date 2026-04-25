import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { SlaThresholdsClient } from '../../settings/sla-thresholds/SlaThresholdsClient'

export default async function SlaMgmtThresholdsPage() {
  const employee = await requireRole(['ad'])
  const supabase = createAdminClient()
  const { data: org } = await supabase.from('orgs').select('id, sla_config').eq('id', employee.org_id).single()
  const slaConfig = (org?.sla_config as Record<string, number> | null) || { A: 1, B: 5, C: 5, D: 20 }
  return <SlaThresholdsClient orgId={employee.org_id} slaConfig={slaConfig} />
}
