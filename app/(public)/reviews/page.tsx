"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { motion } from "motion/react"
import { fadeUp } from "@/lib/motion-variants"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"
import { ReviewForm } from "@/features/reviews/components/review-form"
import {
  getPublishedReviewsAction,
  getReviewsPageStatsAction,
  deleteReviewAction,
} from "@/features/reviews/actions/review"
import type { PublishedReviewItem, ReviewsPageStats } from "@/features/reviews/services"
import type { ReviewWithAuthor } from "@/types/review"

const PAGE_SIZE = 9

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)
}

function displayName(item: PublishedReviewItem): string {
  const full = [item.authorFirstName, item.authorLastName].filter(Boolean).join(" ")
  return full || "Heritage traveler"
}

function toExistingReview(item: PublishedReviewItem): ReviewWithAuthor {
  return {
    id: item.id,
    touristId: item.touristId,
    siteId: item.siteId,
    rating: item.rating,
    comment: item.comment,
    status: "published",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    authorFirstName: item.authorFirstName,
    authorLastName: item.authorLastName,
  }
}

export default function ReviewsPage() {
  const { profile, isLoading } = useAuth()
  const [stats, setStats] = useState<ReviewsPageStats | null>(null)
  const [items, setItems] = useState<PublishedReviewItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    getReviewsPageStatsAction()
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .catch(() => {
        if (!cancelled) setStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  useEffect(() => {
    let cancelled = false
    getPublishedReviewsAction(page)
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setTotal(result.total)
        setError(null)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load reviews")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, reloadKey])

  const refreshStats = useCallback(() => {
    getReviewsPageStatsAction()
      .then((s) => setStats(s))
      .catch(() => {})
  }, [])

  const goToPage = (target: number) => {
    setLoading(true)
    setPage(Math.max(0, target))
  }

  const handleRetry = () => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  const ownId = profile?.id ?? null

  const handleDelete = async (item: PublishedReviewItem) => {
    if (!confirm("Delete your review? This action cannot be undone.")) return
    try {
      await deleteReviewAction(item.id, item.siteId)
      setItems((prev) => prev.filter((r) => r.id !== item.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setEditingId(null)
      refreshStats()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete review")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-10">
        <div className="h-72 animate-pulse rounded-3xl border border-ink/10 bg-card" />
      </div>
    )
  }

  if (!profile) {
    return (
      <RestrictedGuestPrompt
        title="Sign in to view reviews"
        description="Create a free account to read and share stories from heritage explorers in Batangas."
      />
    )
  }

  const statsRow = [
    { value: stats ? stats.averageRating.toFixed(1) : "—", label: "Average Rating" },
    { value: stats ? formatCompact(stats.explorerCount) : "—", label: "Heritage Explorers" },
    { value: stats ? formatCompact(stats.reviewCount) : "—", label: "Reviews Written" },
  ]

  const start = total === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <>
      <section className="bg-cream border-b border-ink/10 pt-0 md:pt-0">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Reviews
            </div>
            <h1 className="text-display text-5xl leading-[1] md:text-7xl">
              Stories from the <em className="italic text-accent">road.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
              Real experiences from heritage explorers, travelers, and community members
              who have walked the trails of Batangas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-parchment/30">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-10">
          <div className="grid grid-cols-3 gap-8">
            {statsRow.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-display text-3xl md:text-4xl text-ink">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink-soft">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 md:px-10 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-14"
        >
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> What People Say
          </div>
          <h2 className="text-display text-4xl leading-[1] md:text-5xl">
            Trusted by <em className="italic text-accent">explorers.</em>
          </h2>
        </motion.div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-ink/10 bg-card" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-ink/10 bg-card p-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 text-sm font-medium text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-ink/10 bg-card p-10 text-center">
            <p className="text-sm text-ink-soft">
              No traveler stories yet. Be the first to share your visit.
            </p>
            <Link
              href="/explore"
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              Find a site to review
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => {
                const isOwn = ownId != null && item.touristId === ownId
                const isEditing = editingId === item.id
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: (i % PAGE_SIZE) * 0.08 }}
                    className="group rounded-2xl border border-ink/10 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-ink/20"
                  >
                    {isEditing ? (
                      <ReviewForm
                        siteId={item.siteId}
                        existingReview={toExistingReview(item)}
                        onSubmit={(updated) => {
                          setItems((prev) =>
                            prev.map((r) =>
                              r.id === updated.id
                                ? {
                                    ...r,
                                    rating: updated.rating,
                                    comment: updated.comment,
                                    updatedAt: updated.updatedAt,
                                  }
                                : r
                            )
                          )
                          setEditingId(null)
                          refreshStats()
                        }}
                        onDelete={() => {
                          setItems((prev) => prev.filter((r) => r.id !== item.id))
                          setTotal((prev) => Math.max(0, prev - 1))
                          setEditingId(null)
                          refreshStats()
                        }}
                      />
                    ) : (
                      <>
                        <div className="mb-4 flex items-center justify-between">
                          <div
                            className="flex items-center gap-1"
                            role="img"
                            aria-label={`${item.rating} out of 5 stars`}
                          >
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                size={14}
                                className={
                                  j < item.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-ink/20"
                                }
                              />
                            ))}
                          </div>
                          <Quote size={16} className="text-ink/10 transition-colors group-hover:text-accent/40" />
                        </div>
                        {item.comment ? (
                          <p className="text-sm leading-relaxed text-ink-soft">
                            &ldquo;{item.comment}&rdquo;
                          </p>
                        ) : (
                          <p className="text-sm italic text-ink-soft/70">Rated this site highly.</p>
                        )}
                        <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-parchment text-xs font-medium text-ink">
                            {displayName(item).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 text-sm font-medium text-ink">
                              <span className="truncate">{displayName(item)}</span>
                              {isOwn && (
                                <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                                  You
                                </span>
                              )}
                            </p>
                            <Link
                              href={`/heritage/${item.siteId}`}
                              className="block truncate text-xs text-ink-soft transition-colors hover:text-accent"
                            >
                              {item.siteName}
                            </Link>
                          </div>
                        </div>
                        {isOwn && (
                          <div className="mt-3 flex gap-3 border-t border-ink/10 pt-3">
                            <button
                              type="button"
                              onClick={() => setEditingId(item.id)}
                              className="text-xs font-medium text-accent hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item)}
                              className="text-xs font-medium text-destructive hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {start}-{end} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() => goToPage(page - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={(page + 1) * PAGE_SIZE >= total || loading}
                  onClick={() => goToPage(page + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-3xl bg-ink px-8 py-20 text-center text-primary-foreground md:px-16 md:py-28"
        >
          <div className="relative">
            <div className="mx-auto mb-6 flex w-fit items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70">
              <span className="h-px w-8 bg-cream/60" /> Share Your Story
            </div>
            <h2 className="text-display text-4xl leading-[1] md:text-6xl">
              Been to Batangas?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-cream/70">
              Your review helps other travelers discover hidden heritage treasures
              and supports local communities.
            </p>
            <Link
              href="/explore"
              className="mt-8 inline-flex rounded-full bg-cream px-8 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream/90"
            >
              Write a Review
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
