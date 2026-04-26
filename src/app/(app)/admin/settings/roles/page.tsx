import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOrgFeatures } from '@/lib/orgFeatures'
import { FeatureGate } from '@/components/FeatureGate'
import { RolesClient } from './RolesClient'
import { DEFAULT_ROLES } from '@/context/orgDefaults'

export const dynamic = 'force-dynamic'

export default async function RolesPage() {
  const employee = await requireRole(['ad'])
  const features = await getOrgFeatures(employee.org_id)

  if (!features.roles) {
    return (
      <FeatureGate
        featureLabel="Role Management"
        description="Define custom roles with granular access permissions — control who can view teams, transfer leads, approve applications, and access admin areas. Upgrade to unlock."
      />
    )
  }

  const supabase = createAdminClient()
  const orgId = employee.org_id

  let { data: roles } = await supabase
    .from('org_roles')
    .select('*')
    .eq('org_id', orgId)
    .order('position')

  if (!roles || roles.length === 0) {
    await supabase.from('org_roles').insert(
      DEFAULT_ROLES.map(r => ({ org_id: orgId, ...r }))
    )
    const { data: fresh } = await supabase
      .from('org_roles')
      .select('*')
      .eq('org_id', orgId)
      .order('position')
    roles = fresh
  }

  return <RolesClient orgId={orgId} initialRoles={roles || []} />
}
