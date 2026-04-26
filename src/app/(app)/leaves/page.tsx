import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getOrgFeatures } from '@/lib/orgFeatures'
import { FeatureGate } from '@/components/FeatureGate'
import { LeavesClient } from './LeavesClient'

export default async function LeavesPage() {
  const employee = await requireAuth()
  const features = await getOrgFeatures(employee.org_id)

  if (!features.attendance) {
    return (
      <FeatureGate
        featureLabel="Leave Management"
        description="Request and track leaves, get approvals from your manager, and maintain a clear leave history. Contact Consultrack to enable this module for your org."
      />
    )
  }

  const supabase = await createClient()
  const { data: leaves } = await supabase
    .from('leaves')
    .select('*')
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false })

  return <LeavesClient employee={employee} leaves={leaves || []} />
}
