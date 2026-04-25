import { CardSkeleton, StatsSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <PageHeaderSkeleton />
      <StatsSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
