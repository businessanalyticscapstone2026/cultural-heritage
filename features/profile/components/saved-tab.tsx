"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bookmark, Compass, MapPin, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { toggleBookmarkAction } from "@/features/heritage/actions/bookmark"
import type { SavedSite } from "@/types/heritage"

interface SavedTabProps {
  initialSites: SavedSite[]
}

export default function SavedTab({ initialSites }: SavedTabProps) {
  const [sites, setSites] = useState<SavedSite[]>(initialSites)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (siteId: string) => {
    setRemovingId(siteId)
    const site = sites.find((s) => s.siteId === siteId)
    setSites((prev) => prev.filter((s) => s.siteId !== siteId))
    try {
      await toggleBookmarkAction(siteId)
    } catch {
      if (site) setSites((prev) => [...prev, site])
    } finally {
      setRemovingId(null)
    }
  }

  const municipalities = [...new Set(sites.map((s) => s.municipalityName).filter(Boolean))] as string[]
  const categories = [...new Set(sites.map((s) => s.categoryName).filter(Boolean))] as string[]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-display text-lg text-ink">
          <Bookmark size={18} strokeWidth={1.5} className="text-accent" />
          Saved Destinations
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          {sites.length === 0
            ? "No saved sites yet."
            : `${sites.length} site${sites.length === 1 ? "" : "s"} saved`}
        </p>
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-parchment/30 px-8 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
            <Bookmark size={24} strokeWidth={1.5} className="text-ink-soft/40" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink">No saved sites yet</p>
          <p className="mt-1 max-w-xs text-xs text-ink-soft">
            Bookmark heritage sites you&apos;re interested in and they&apos;ll appear here.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink/90"
          >
            <Compass size={14} strokeWidth={1.5} />
            Explore Heritage Sites
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div
              key={site.siteId}
              className="group overflow-hidden rounded-xl border border-ink/10 bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/heritage/${site.siteId}`} className="block">
                <div className="relative aspect-[4/3]">
                  {site.thumbnail ? (
                    <Image
                      src={site.thumbnail}
                      alt={site.siteName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-parchment">
                      <MapPin size={24} strokeWidth={1.5} className="text-ink-soft/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="truncate text-[10px] font-mono uppercase tracking-widest text-ink-soft">
                    {site.categoryName ?? "Heritage Site"}
                  </p>
                  <h4 className="mt-1 truncate text-sm font-semibold text-ink">{site.siteName}</h4>
                  {site.municipalityName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                      <MapPin size={10} strokeWidth={1.5} />
                      {site.municipalityName}
                    </p>
                  )}
                </div>
              </Link>
              <div className="flex border-t border-ink/10 px-4 py-2">
                <button
                  onClick={() => handleRemove(site.siteId)}
                  disabled={removingId === site.siteId}
                  className="flex items-center gap-1 text-xs text-ink-soft transition-colors hover:text-destructive disabled:opacity-50"
                >
                  {removingId === site.siteId ? (
                    <Loader2 size={10} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <Trash2 size={10} strokeWidth={1.5} />
                  )}
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
