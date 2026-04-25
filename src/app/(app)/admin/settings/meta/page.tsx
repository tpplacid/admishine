import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AdminMetaClient } from '../../meta/AdminMetaClient'

export default async function SettingsMetaPage() {
  const employee = await requireRole(['ad'])
  const supabase = await createClient()
  const { data: metaLeads } = await supabase.from('leads').select('*').eq('source', 'meta').eq('org_id', employee.org_id).order('created_at', { ascending: false }).limit(100)
  const lastSync = metaLeads?.[0]?.created_at || null
  return <AdminMetaClient admin={employee} metaLeads={metaLeads || []} lastSync={lastSync} />
}
