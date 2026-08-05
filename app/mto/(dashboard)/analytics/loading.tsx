import { Skeleton } from "@/components/ui/skeleton"

export default function MTOAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[340px] rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[340px] rounded-xl" />
        </div>
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-xl" />
        <Skeleton className="h-[320px] rounded-xl" />
      </div>
    </div>
  )
}
