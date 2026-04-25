import { requireRole } from '@/lib/auth'
import { TeamTabNav } from './TabNav'

export default async function TeamMgmtLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['ad'])
  return (
    <div className="flex flex-col h-full">
      <TeamTabNav />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
