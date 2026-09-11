import { Skeleton } from "@/components/ui/skeleton"

export default function FeedbackLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
