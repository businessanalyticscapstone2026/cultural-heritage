"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { HomeMapPin } from "@/features/home/types"

const AtlasMapCanvas = dynamic(
  () => import("./atlas-map-canvas").then((m) => m.AtlasMapCanvas),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-muted/40" />,
  },
)

interface AtlasMapPreviewProps {
  pins: HomeMapPin[]
}

export function AtlasMapPreview({ pins }: AtlasMapPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (pins.length === 0) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-ink/10 bg-parchment/30 backdrop-blur md:h-[600px]">
        <MapPin size={32} className="text-ink/20" strokeWidth={1.5} />
        <p className="max-w-xs text-center text-sm text-ink-soft">
          Heritage site pins will appear here once published sites with coordinates are available.
        </p>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-soft/40">
          Atlas preview
        </span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-ink/10 bg-background shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] md:h-[600px]"
    >
      {/* Site count chip */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-ink/10 bg-background/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur-sm">
        <span className="size-2 rounded-full bg-accent" />
        {pins.length} {pins.length === 1 ? "SITE" : "SITES"}
      </div>

      {isVisible ? (
        <AtlasMapCanvas pins={pins} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
          <MapPin size={28} className="animate-pulse text-ink/20" />
        </div>
      )}
    </div>
  )
}
