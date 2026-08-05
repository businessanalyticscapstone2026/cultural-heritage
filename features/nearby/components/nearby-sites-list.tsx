"use client"

import type { NearbySite, TravelMode } from "@/types/heritage"
import { Stagger, StaggerItem } from "@/components/animations/reveal"
import NearbySiteCard from "./nearby-site-card"

interface NearbySitesListProps {
  sites: NearbySite[]
  mode: TravelMode
}

export default function NearbySitesList({ sites, mode }: NearbySitesListProps) {
  return (
    <section aria-label="Nearby heritage sites" aria-live="polite">
      <Stagger className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <StaggerItem key={site.siteId}>
            <NearbySiteCard site={site} mode={mode} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
