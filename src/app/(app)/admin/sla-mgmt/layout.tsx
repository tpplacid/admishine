import { requireRole } from '@/lib/auth'
import { SlaTabNav } from './TabNav'

export default async function SlaMgmtLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['ad'])
  return (
    <div className="flex flex-col h-full">
      <SlaTabNav />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
