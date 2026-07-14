import { Skeleton } from "@/components/ui/skeleton"

export default function MTOAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-48" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>

          <Skeleton className="h-[372px] w-full rounded-xl" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[350px] rounded-xl" />
            <Skeleton className="h-[350px] rounded-xl" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-[310px] rounded-xl" />
            <Skeleton className="h-[310px] rounded-xl" />
          </div>

          <Skeleton className="h-[400px] rounded-xl" />
        </div>

        <aside className="hidden xl:block">
          <Skeleton className="h-[400px] rounded-xl" />
        </aside>
      </div>
    </div>
  )
}
