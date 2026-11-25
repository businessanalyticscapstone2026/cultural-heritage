import { Skeleton } from "@/components/ui/skeleton"

export default function MTOUsersLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 rounded-xl" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
