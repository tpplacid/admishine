import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getOrgFeatures } from '@/lib/orgFeatures'
import { FeatureGate } from '@/components/FeatureGate'
import { SlaExplanationsClient } from './SlaExplanationsClient'

export default async function SlaExplanationsPage() {
  const employee = await requireAuth()
  const features = await getOrgFeatures(employee.org_id)

  if (!features.sla) {
    return (
      <FeatureGate
        featureKey="sla"
        featureLabel="Deadline Breach Explanations"
        description="When a lead exceeds its deadline, counsellors are prompted to explain why. This keeps your team accountable and gives managers full visibility. Upgrade to enable deadline tracking."
      />
    )
  }

  const supabase = await createClient()
  const { data: breaches } = await supabase
    .from('sla_breaches')
    .select('*, lead:leads(id,name,phone,main_stage)')
    .eq('owner_id', employee.id)
    .eq('resolution', 'explanation_requested')
    .eq('explanation_status', 'pending')
    .order('created_at', { ascending: false })

  return <SlaExplanationsClient employee={employee} breaches={breaches || []} />
}
