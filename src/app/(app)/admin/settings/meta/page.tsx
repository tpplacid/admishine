import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getOrgFeatures } from '@/lib/orgFeatures'
import { FeatureGate } from '@/components/FeatureGate'
import { AdminMetaClient } from '../../meta/AdminMetaClient'

export default async function SettingsMetaPage() {
  const employee = await requireRole(['ad'])
  const features = await getOrgFeatures(employee.org_id)

  if (!features.meta) {
    return (
      <FeatureGate
        featureKey="meta"
        featureLabel="Meta Lead Integration"
        description="Automatically pull leads from your Meta (Facebook & Instagram) ad campaigns directly into the pipeline — no manual data entry. Upgrade to connect Meta."
      />
    )
  }

  const supabase = await createClient()
  const { data: metaLeads } = await supabase.from('leads').select('*').eq('source', 'meta').eq('org_id', employee.org_id).order('created_at', { ascending: false }).limit(100)
  const lastSync = metaLeads?.[0]?.created_at || null
  return <AdminMetaClient admin={employee} metaLeads={metaLeads || []} lastSync={lastSync} />
}
