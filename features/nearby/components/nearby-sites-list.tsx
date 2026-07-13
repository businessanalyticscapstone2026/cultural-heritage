"use client"

import type { NearbySite, TravelMode } from "@/types/heritage"
import NearbySiteCard from "./nearby-site-card"

interface NearbySitesListProps {
  sites: NearbySite[]
  mode: TravelMode
}

export default function NearbySitesList({ sites, mode }: NearbySitesListProps) {
  return (
    <section aria-label="Nearby heritage sites" aria-live="polite">
      <div className="space-y-3">
        {sites.map((site) => (
          <NearbySiteCard key={site.siteId} site={site} mode={mode} />
        ))}
      </div>
    </section>
  )
}
