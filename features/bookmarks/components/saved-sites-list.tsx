"use client"

import type { SavedSite } from "@/types/heritage"
import { SavedSiteCard } from "./saved-site-card"

interface SavedSitesListProps {
  sites: SavedSite[]
  onRemove: (siteId: string) => void
}

export function SavedSitesList({ sites, onRemove }: SavedSitesListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <SavedSiteCard
          key={site.siteId}
          site={site}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
