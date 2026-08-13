"use client"

import { AlertTriangle } from "lucide-react"

export default function MunicipalitiesError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold">Something went wrong</h2>

      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t load municipality management. Please try again.
      </p>

      <button
        onClick={() => unstable_retry()}
        className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  )
}
