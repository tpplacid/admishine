import { TableSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton'

export default function AdminLeadsLoading() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} />
    </div>
  )
}
