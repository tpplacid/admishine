import { TableSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton'

export default function AttendanceLoading() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} />
    </div>
  )
}
