"use client"

import { useEffect, useState } from "react"
import { getSitePopularityAction } from "../actions/monitoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpDown } from "lucide-react"
import type { SitePopularity } from "../types"

interface DestinationPopularityPanelProps {
  searchParams: Record<string, string | undefined>
  initialData?: SitePopularity[]
}

export default function DestinationPopularityPanel({
  searchParams,
  initialData,
}: DestinationPopularityPanelProps) {
  const [data, setData] = useState<SitePopularity[] | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)

  const spKey = JSON.stringify(searchParams)

  useEffect(() => {
    if (initialData) {
      setData(initialData)
      return
    }

    let cancelled = false
    async function load() {
      try {
        setData(null)
        setError(null)
        const result = await getSitePopularityAction(searchParams)
        if (!cancelled) setData(result)
      } catch {
        if (!cancelled) setError("Failed to load site popularity data.")
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, spKey])

  const sorted = data
    ? [...data].sort((a, b) =>
        sortAsc ? a.visits - b.visits : b.visits - a.visits
      )
    : []

  const displayed = sorted.slice(0, 10)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Destination Popularity
        </CardTitle>
        <button
          type="button"
          onClick={() => setSortAsc((prev) => !prev)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
        >
          <ArrowUpDown className="size-4" />
        </button>
      </CardHeader>
      <CardContent>
        {data === null && !error && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 flex-1 rounded" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {data !== null && data.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">
            No visit data for the selected period.
          </p>
        )}

        {data !== null && data.length > 0 && !error && (
          <div className="space-y-2.5">
            {displayed.map((site) => (
              <div key={site.siteId} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{site.siteName}</span>
                  <span className="text-xs text-muted-foreground">
                    {site.visits.toLocaleString()} visits ({site.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(site.percentage, 2)}%`,
                      backgroundColor: "#2E5BFF",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
