"use client"

import { useState } from "react"
import { Share2, Star } from "lucide-react"
import { BookmarkButton } from "./bookmark-button"

interface TitleRowProps {
  siteName: string
  municipalityName: string | null
  barangay: string | null
  matchScore?: number
  siteId: string
  initialIsBookmarked?: boolean
}

export default function TitleRow({
  siteName,
  municipalityName,
  barangay,
  matchScore,
  siteId,
  initialIsBookmarked = false,
}: TitleRowProps) {
  const [copied, setCopied] = useState(false)

  const location = [barangay, municipalityName].filter(Boolean).join(", ")

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-heading lg:text-4xl">
          {siteName}
        </h1>
        {location && (
          <p className="mt-1 text-sm text-muted">{location}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {matchScore !== undefined && (
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <Star className="h-3 w-3 fill-success" />
            {matchScore}% Match
          </span>
        )}

        <BookmarkButton siteId={siteId} initialIsBookmarked={initialIsBookmarked} />

        <div className="relative">
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-heading transition-colors hover:bg-muted"
            aria-label="Share this page"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-heading px-2 py-1 text-xs text-white">
              Link copied!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
