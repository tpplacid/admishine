import { TableSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton'

export default function TeamMgmtLoading() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} />
    </div>
  )
}
