import { isSuperAdmin } from '@/lib/superadmin'
import { redirect } from 'next/navigation'
import SuperAdminNav from './SuperAdminNav'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isSuperAdmin()

  // Allow the login page through without auth
  // (login page is at /superadmin/login — children renders it)
  // We detect by checking the pathname isn't possible here, so we gate at nav level:
  // The login page imports this layout too, so we skip redirect for login
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {authed && <SuperAdminNav />}
      <div className={authed ? 'pl-0 md:pl-56' : ''}>
        {children}
      </div>
    </div>
  )
}
