"use client"

import { Church, Landmark, Building2, MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import type { HomeCategory, HomeMapSite, HomeStats } from "@/features/home/types"

const MapInner = dynamic(
  () => import("@/components/shared/map-inner"),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-muted" /> },
)

const iconMap: Record<string, typeof Church> = {
  Church,
  Landmark,
  Building2,
  MapPin,
}

function getCategoryIcon(iconName: string | null) {
  if (iconName && iconName in iconMap) return iconMap[iconName]
  return MapPin
}

interface MapSectionProps {
  categories: HomeCategory[]
  sites: HomeMapSite[]
  stats: HomeStats
}

export default function MapSection({ categories, sites, stats }: MapSectionProps) {
  return (
    <section className="bg-card py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2 className="font-heading text-2xl font-semibold text-heading">
          Interactive Heritage Map
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr_260px]">
          <div className="rounded-xl border border-border bg-card p-5 shadow-md">
            <ul className="space-y-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon)
                return (
                  <li key={cat.id} className="flex items-center gap-3">
                    <Icon
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm text-body">{cat.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative h-80 overflow-hidden rounded-xl border border-border shadow-md lg:h-[300px]">
            <MapInner sites={sites} />
          </div>

          <div className="grid grid-cols-2 content-start gap-3">
            <StatCard value={stats.heritageSiteCount} label="Heritage Sites" />
            <StatCard value={stats.municipalityCount} label="Municipalities" />
            <StatCard value={stats.visitorCount} label="Visitors" />
            <StatCard
              value={`${stats.positiveReviewPercent}%`}
              label="Positive Reviews"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-center shadow-md">
      <p className="font-heading text-xl font-semibold text-primary">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  )
}
