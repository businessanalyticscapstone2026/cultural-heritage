"use client"

import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function HeritageDetailError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>

      <h2 className="mt-6 font-heading text-2xl font-semibold text-heading">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-md text-body">
        We couldn&apos;t load the heritage site details. Please try again or
        return to the explore page.
      </p>

      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href="/explore"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-muted"
        >
          Back to Explore
        </Link>
      </div>
    </div>
  )
}
