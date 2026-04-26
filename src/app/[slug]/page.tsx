import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import OrgLoginClient from './OrgLoginClient'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

// These are top-level app routes — [slug] must not capture them
const RESERVED_SLUGS = new Set(['login', 'invite', 'superadmin', 'api', 'dashboard', 'leads', 'team', 'reports', 'admin', 'attendance'])

export default async function OrgLoginPage({ params }: Props) {
  const { slug } = await params

  if (RESERVED_SLUGS.has(slug)) notFound()

  const supabase = createAdminClient()
  const { data: org } = await supabase
    .from('orgs')
    .select('id, name, slug, logo_url')
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  return <OrgLoginClient orgName={org.name} orgSlug={org.slug} logoUrl={org.logo_url} />
}
