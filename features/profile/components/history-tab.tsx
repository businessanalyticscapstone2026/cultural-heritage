"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, MapPin, Bookmark, ExternalLink } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDistanceToNow } from "@/lib/format-time"
import type { RecommendationHistoryItem } from "../types"

interface HistoryTabProps {
  items: RecommendationHistoryItem[]
}

export default function HistoryTab({ items }: HistoryTabProps) {
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-display text-lg text-ink">
            <Clock size={18} strokeWidth={1.5} className="text-accent" />
            Recommendation History
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Sites recommended for you based on your preferences.
          </p>
        </div>

        <EmptyState
          icon={<Clock size={24} strokeWidth={1.5} className="text-ink-soft/40" />}
          title="No recommendations yet"
          description="Start exploring heritage sites to get personalized recommendations."
          actions={[{ label: "Explore Sites", href: "/explore" }]}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-display text-lg text-ink">
          <Clock size={18} strokeWidth={1.5} className="text-accent" />
          Recommendation History
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          {items.length} recommendation{items.length === 1 ? "" : "s"} based on your preferences.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/heritage/${item.siteId}`}
            className="group flex items-start gap-4 rounded-xl border border-ink/10 bg-card p-4 transition-all hover:shadow-md hover:border-ink/20"
          >
            {item.imageUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.siteName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-parchment">
                <MapPin size={20} strokeWidth={1.5} className="text-ink-soft/40" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                    {item.siteName}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                    {item.categoryName && <span>{item.categoryName}</span>}
                    {item.categoryName && item.municipalityName && <span>·</span>}
                    {item.municipalityName && <span>{item.municipalityName}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.matchScore > 0 && (
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                      {item.matchScore}% Match
                    </span>
                  )}
                </div>
              </div>

              {item.reasons.length > 0 && (
                <p className="mt-2 text-xs text-ink-soft line-clamp-1">
                  {item.reasons[0]}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3 text-[10px] text-ink-soft/60">
                <span>{formatDistanceToNow(new Date(item.createdAt))}</span>
                {item.wasClicked && (
                  <span className="flex items-center gap-0.5">
                    <ExternalLink size={8} strokeWidth={1.5} />
                    Viewed
                  </span>
                )}
                {item.bookmarked && (
                  <span className="flex items-center gap-0.5">
                    <Bookmark size={8} strokeWidth={1.5} />
                    Saved
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
