"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { Search, X, SlidersHorizontal, Star, MapPin, Clock, ChevronRight, ChevronLeft } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { CardBookmarkButton } from "@/features/bookmarks/components"
import type { HeritageSite } from "@/types/heritage"
import type { ExploreResult, ExploreCategory } from "../services/explore"

interface ExploreClientProps {
  initialData: ExploreResult
  categories: ExploreCategory[]
  municipalities: { id: string; name: string }[]
  historicalPeriods: string[]
  searchQuery: string
  activeCategoryId: string | null
  activeMunicipalityId: string
  activeHistoricalPeriod: string
  activeAccessibility: string
}

export default function ExploreClient({
  initialData,
  categories,
  municipalities,
  historicalPeriods,
  searchQuery,
  activeCategoryId,
  activeMunicipalityId,
  activeHistoricalPeriod,
  activeAccessibility,
}: ExploreClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchInput, setSearchInput] = useState(searchQuery)
  const debouncedSearch = useDebounce(searchInput, 300)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const displaySites = isPending ? initialData.sites : initialData.sites

  useEffect(() => {
    const siteIds = initialData.sites.map((s) => s.id)
    if (siteIds.length === 0) return
    fetch("/api/bookmarks/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteIds }),
    })
      .then((r) => r.json())
      .then((data) => setBookmarkedIds(new Set(data.bookmarked)))
      .catch(() => {})
  }, [initialData.sites])

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

  const activeFilterCount = [
    searchQuery && "search",
    activeCategoryId && "category",
    activeMunicipalityId && "municipality",
    activeHistoricalPeriod && "period",
    activeAccessibility && "accessibility",
  ].filter(Boolean).length

  return (
    <>
      <section className="bg-cream border-b border-ink/10 pt-20 md:pt-24">
        <div className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Explore Heritage
            </div>
            <h1 className="text-display text-5xl leading-[1] md:text-6xl">
              Browse all heritage sites
            </h1>
            <p className="mt-4 max-w-lg text-ink-soft">
              Discover colonial churches, archaeological treasures, and natural heritage across Batangas 1st District.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 md:px-10 pb-24 md:pb-32">
        <div className="flex flex-col gap-4 py-8 border-b border-ink/10 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search sites&hellip;"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-full border border-ink/10 bg-card py-2 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 transition-colors"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3 py-1.5">
              <SlidersHorizontal size={12} strokeWidth={1.5} className="text-ink-soft" />
              <select
                value={activeMunicipalityId}
                onChange={(e) => {
                  startTransition(() => {
                    router.replace(buildUrl({ municipality: e.target.value || null, page: "1" }), { scroll: false })
                  })
                }}
                className="appearance-none bg-transparent text-xs text-ink outline-none cursor-pointer pr-4"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%23666' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 4px center",
                }}
              >
                <option value="">All municipalities</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  activeCategoryId === null
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-ink/10 text-ink-soft hover:border-ink/25 hover:text-ink"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(activeCategoryId === cat.id ? null : cat.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition ${
                    activeCategoryId === cat.id
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-ink/10 text-ink-soft hover:border-ink/25 hover:text-ink"
                  }`}
                >
                  {cat.icon && <span>{cat.icon} </span>}
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3 py-1.5">
              <Clock size={12} strokeWidth={1.5} className="text-ink-soft" />
              <select
                value={activeHistoricalPeriod}
                onChange={(e) => {
                  startTransition(() => {
                    router.replace(buildUrl({ period: e.target.value || null, page: "1" }), { scroll: false })
                  })
                }}
                className="appearance-none bg-transparent text-xs text-ink outline-none cursor-pointer pr-4"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%23666' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 4px center",
                }}
              >
                <option value="">All periods</option>
                {historicalPeriods.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  startTransition(() => {
                    router.replace("/explore", { scroll: false })
                  })
                }}
                className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink-soft hover:text-ink transition"
              >
                <X size={10} />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-6 font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">
          <span>Showing {from}&ndash;{to} of {totalCount} sites</span>
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-ink-soft">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
            Updating results...
          </div>
        )}

        {totalCount === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-ink/15 bg-parchment/30 px-8 py-20 text-center">
            <p className="text-ink-soft">No sites match your filters. Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displaySites.map((site: HeritageSite, i) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/heritage/${site.id}`}
                    className="group flex flex-col rounded-2xl border border-ink/10 bg-card overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
                      <img
                        src={site.media?.find(m => m.isPrimary || m.mediaType === "image")?.fileUrl ?? ""}
                        alt={site.siteName}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const t = e.currentTarget
                          t.style.display = "none"
                          t.parentElement!.style.background = "linear-gradient(135deg, #0f2747 0%, #1a3f6a 50%)"
                        }}
                      />
                      {site.category?.name && (
                        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">
                          {site.category.name}
                        </span>
                      )}
                      <CardBookmarkButton
                        siteId={site.id}
                        initialIsBookmarked={bookmarkedIds.has(site.id)}
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-display text-lg leading-tight text-ink">
                        {site.siteName}
                      </h3>

                      <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} strokeWidth={1.5} />
                          {site.municipalityName}
                        </span>
                        {site.yearEstablished && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} strokeWidth={1.5} />
                            {site.yearEstablished}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-ink-soft line-clamp-2">
                        {site.shortDescription}
                      </p>

                      <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-ink-soft">
                        <Star size={12} strokeWidth={1.5} className="text-accent" />
                        <span>{site.averageRating?.toFixed(1) ?? "N/A"}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-10 font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-full border border-ink/10 px-4 py-2 text-xs text-ink-soft transition hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={12} /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                      return (
                        <span key={p} className="flex items-center gap-1">
                          {showEllipsis && <span className="px-1 text-ink/30">&hellip;</span>}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`rounded-full px-3 py-1.5 text-xs transition ${
                              p === page
                                ? "bg-accent text-accent-foreground"
                                : "border border-ink/10 text-ink-soft hover:text-ink"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      )
                    })}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 rounded-full border border-ink/10 px-4 py-2 text-xs text-ink-soft transition hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
