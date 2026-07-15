"use client"

import { useState } from "react"
import { getRecommendationsAction } from "@/features/recommendation/actions"
import type { RecommendationResult } from "@/types/recommendation"
import Link from "next/link"

interface Props {
  initialResults: RecommendationResult[]
}

export default function TouristRecommendationsClient({ initialResults }: Props) {
  const [results, setResults] = useState<RecommendationResult[]>(initialResults)
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const data = await getRecommendationsAction({
        interests: [],
        preferredCategoryIds: [],
        limit: 20,
      })
      setResults(data)
    } finally {
      setLoading(false)
    }
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No recommendations yet. Update your profile interests or start exploring to get suggestions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Link
            key={r.site.id}
            href={`/heritage/${r.site.id}`}
            className="group rounded-xl border bg-card p-4 transition hover:shadow-md"
          >
            <div className="aspect-[4/3] mb-3 overflow-hidden rounded-lg bg-muted">
              {r.site.media.find((m) => m.isPrimary) ? (
                <img
                  src={r.site.media.find((m) => m.isPrimary)!.fileUrl}
                  alt={r.site.siteName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {r.site.category && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {r.site.category.name}
                  </span>
                )}
                {r.site.yearEstablished && (
                  <span className="text-xs text-muted-foreground">
                    {r.site.yearEstablished}
                  </span>
                )}
              </div>

              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                {r.site.siteName}
              </h3>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {r.matchPercentage}% Match
                </span>
                {r.site.municipalityName && (
                  <span className="text-xs text-muted-foreground">
                    {r.site.municipalityName}
                  </span>
                )}
              </div>

              {r.reasons.length > 0 && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {r.reasons[0]}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
