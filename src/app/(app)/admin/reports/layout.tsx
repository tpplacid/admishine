import { requireRole } from '@/lib/auth'
import { ReportsTabNav } from './TabNav'

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['ad'])
  return (
    <div className="flex flex-col h-full">
      <ReportsTabNav />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
