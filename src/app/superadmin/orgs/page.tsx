import { requireSuperAdmin } from '@/lib/superadmin'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function SuperAdminOrgsPage() {
  await requireSuperAdmin()
  const supabase = createAdminClient()

  const { data: orgs } = await supabase
    .from('orgs')
    .select('id, name, slug, created_at')
    .order('created_at', { ascending: false })

  // Get employee counts per org
  const orgIds = (orgs || []).map(o => o.id)
  const counts: Record<string, number> = {}

  if (orgIds.length > 0) {
    const { data: empData } = await supabase
      .from('employees')
      .select('org_id')
      .in('org_id', orgIds)

    for (const e of empData || []) {
      counts[e.org_id] = (counts[e.org_id] || 0) + 1
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Organisations</h1>
            <p className="text-slate-400 text-sm mt-0.5">{orgs?.length || 0} organisations</p>
          </div>
          <Link
            href="/superadmin/orgs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold transition"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Organisation
          </Link>
        </div>

        {/* Orgs list */}
        {!orgs || orgs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium text-slate-400 mb-2">No organisations yet</p>
            <p className="text-sm">Create your first organisation to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map(org => (
              <Link
                key={org.id}
                href={`/superadmin/orgs/${org.id}`}
                className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-5 py-4 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-900 border border-teal-800 flex items-center justify-center shrink-0">
                    <span className="text-teal-400 font-bold text-sm uppercase">
                      {org.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{org.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      consultrack.vercel.app/<span className="text-slate-400">{org.slug}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-white text-sm font-semibold">{counts[org.id] || 0}</p>
                    <p className="text-slate-500 text-xs">employees</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-slate-400 text-xs">
                      {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition shrink-0">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
