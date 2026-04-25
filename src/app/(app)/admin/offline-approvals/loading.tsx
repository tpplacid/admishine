import { CardSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton'

export default function OfflineApprovalsLoading() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <PageHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
