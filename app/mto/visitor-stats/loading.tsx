import { Skeleton } from "@/components/ui/skeleton"

export default function MTOVisitorStatsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-40 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-[300px] w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-[300px] rounded-xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
