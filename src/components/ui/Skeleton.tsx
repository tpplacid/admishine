export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-6">
        <div className="animate-pulse bg-slate-200 rounded h-3 w-32" />
        <div className="animate-pulse bg-slate-200 rounded h-3 w-20" />
        <div className="animate-pulse bg-slate-200 rounded h-3 w-24" />
        <div className="animate-pulse bg-slate-200 rounded h-3 w-20" />
        <div className="animate-pulse bg-slate-200 rounded h-3 w-24" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-6 items-center">
            <div className="animate-pulse bg-slate-200 rounded h-3 w-36" />
            <div className="animate-pulse bg-slate-200 rounded h-3 w-24" />
            <div className="animate-pulse bg-slate-200 rounded h-3 w-28" />
            <div className="animate-pulse bg-slate-200 rounded h-3 w-16" />
            <div className="animate-pulse bg-slate-200 rounded h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>
  )
}
