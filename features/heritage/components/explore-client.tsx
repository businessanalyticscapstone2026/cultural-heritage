"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon, XIcon } from "lucide-react"
import HeritageCard from "@/components/shared/heritage-card"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import type { HeritageSite } from "@/types/heritage"
import type { ExploreResult, ExploreCategory } from "../services/explore"

interface ExploreClientProps {
  initialData: ExploreResult
  categories: ExploreCategory[]
  searchQuery: string
  activeCategoryId: string | null
}

export default function ExploreClient({
  initialData,
  categories,
  searchQuery,
  activeCategoryId,
}: ExploreClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchInput, setSearchInput] = useState(searchQuery)
  const debouncedSearch = useDebounce(searchInput, 300)
  const displaySites = isPending ? initialData.sites : initialData.sites

  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const qs = params.toString()
      return `/explore${qs ? `?${qs}` : ""}`
    },
    [searchParams],
  )

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      startTransition(() => {
        router.replace(buildUrl({ q: debouncedSearch || null, page: "1" }), { scroll: false })
      })
    }
  }, [debouncedSearch, searchQuery, router, buildUrl])

  const handleCategoryClick = (categoryId: string | null) => {
    startTransition(() => {
      router.replace(buildUrl({ category: categoryId, page: "1" }), { scroll: false })
    })
  }

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.replace(buildUrl({ page: String(page) }), { scroll: true })
    })
  }

  const clearSearch = () => {
    setSearchInput("")
  }

  const page = initialData.page
  const totalPages = initialData.totalPages
  const pageSize = initialData.pageSize
  const totalCount = initialData.totalCount

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search heritage sites..."
            aria-label="Search heritage sites"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              aria-pressed={activeCategoryId === null}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                activeCategoryId === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  handleCategoryClick(activeCategoryId === cat.id ? null : cat.id)
                }
                aria-pressed={activeCategoryId === cat.id}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  activeCategoryId === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.icon && <span className="text-sm">{cat.icon}</span>}
                {cat.name}
                <span className="opacity-60">({cat.siteCount})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          Updating results...
        </div>
      )}

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-foreground">No heritage sites found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter to discover cultural heritage sites.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displaySites.map((site: HeritageSite) => (
              <HeritageCard key={site.id} site={site} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between"
            >
              <p className="text-sm text-muted-foreground" role="status">
                Showing <span className="font-medium">{from}</span> to{" "}
                <span className="font-medium">{to}</span> of{" "}
                <span className="font-medium">{totalCount}</span> sites
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Prev
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                    return (
                      <span key={p} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-1 text-xs text-muted-foreground">&hellip;</span>
                        )}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="xs"
                          onClick={() => handlePageChange(p)}
                          aria-label={`Page ${p}`}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p}
                        </Button>
                      </span>
                    )
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
