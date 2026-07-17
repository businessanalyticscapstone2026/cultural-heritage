"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Route } from "lucide-react"
import type { HeritageSite, NearbySite, TravelMode } from "../types"
import Breadcrumb from "./breadcrumb"
import HeroImage from "./hero-image"
import TitleRow from "./title-row"
import ClassificationTags from "./classification-tags"
import QuickFactsStrip from "./quick-facts-strip"
import AboutSection from "./about-section"
import HistoricalTimeline from "./historical-timeline"
import PhotoGallery from "./photo-gallery"
import AccessibilityNotes from "./accessibility-notes"
import LocationCard from "./location-card"
import NearbyMiniMap from "./nearby-mini-map"
import NearbySitesSidebar from "./nearby-sites-sidebar"
import { ReviewsSection } from "@/features/reviews/components"

interface HeritageDetailClientProps {
  site: HeritageSite
  matchScore?: number
  initialIsBookmarked?: boolean
}

export default function HeritageDetailClient({
  site,
  matchScore,
  initialIsBookmarked = false,
}: HeritageDetailClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [nearbySites, setNearbySites] = useState<NearbySite[]>([])
  const [nearbyMode, setNearbyMode] = useState<TravelMode>("walking")
  const [selectedNearbySiteId, setSelectedNearbySiteId] = useState<string | null>(null)

  const images = site.media.filter((m) => m.mediaType === "image")
  const hasCoordinates = site.latitude !== null && site.longitude !== null

  useEffect(() => {
    let cancelled = false

    async function fetchNearby() {
      try {
        if (!hasCoordinates) return
        const params = new URLSearchParams({
          lat: String(site.latitude),
          long: String(site.longitude),
          radius: "10",
          mode: nearbyMode,
          limit: "8",
        })
        const res = await fetch(`/api/heritage/nearby?${params}`)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setNearbySites(data.results ?? [])
        }
      } catch {
        // Silently fail — nearby is optional
      }
    }

    fetchNearby()
    return () => { cancelled = true }
  }, [site.id, site.latitude, site.longitude, hasCoordinates, nearbyMode])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = "hidden"
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    document.body.style.overflow = ""
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : null
        )
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : null
        )
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex, images.length, closeLightbox])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Breadcrumb
          items={[
            { label: "Explore", href: "/explore" },
            { label: site.siteName },
          ]}
        />

        <div className="mt-6">
          <HeroImage
            media={site.media}
            siteName={site.siteName}
            onViewAll={images.length > 0 ? () => openLightbox(0) : undefined}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-8">
            <TitleRow
              siteName={site.siteName}
              municipalityName={site.municipalityName}
              barangay={site.barangay}
              matchScore={matchScore}
              siteId={site.id}
              initialIsBookmarked={initialIsBookmarked}
            />

            <ClassificationTags
              category={site.category}
              tags={site.tags}
            />

            <QuickFactsStrip
              category={site.category}
              yearEstablished={site.yearEstablished}
              designation={site.designation}
              operatingHours={site.operatingHours}
              entranceFee={site.entranceFee}
            />

            <AboutSection
              shortDescription={site.shortDescription}
              detailedDescription={site.detailedDescription}
            />

            <HistoricalTimeline
              historicalPeriod={site.historicalPeriod}
              yearEstablished={site.yearEstablished}
              historicalSignificance={site.historicalSignificance}
            />

            <PhotoGallery
              media={site.media}
              lightboxIndex={lightboxIndex}
              onOpenLightbox={openLightbox}
              onCloseLightbox={closeLightbox}
            />

            <AccessibilityNotes accessibilityInfo={site.accessibilityInfo} />

            <ReviewsSection siteId={site.id} />
          </div>

          <aside className="space-y-6">
            <LocationCard
              siteId={site.id}
              barangay={site.barangay}
              municipalityName={site.municipalityName}
              exactAddress={site.exactAddress}
              latitude={site.latitude}
              longitude={site.longitude}
            />

            {hasCoordinates && (
              <Link
                href={`/map?planRoute=${site.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Route className="size-4" />
                Plan My Trip
              </Link>
            )}

            {hasCoordinates && nearbySites.length > 0 && (
              <NearbyMiniMap
                siteLatitude={site.latitude!}
                siteLongitude={site.longitude!}
                siteName={site.siteName}
                sites={nearbySites}
                selectedSiteId={selectedNearbySiteId}
                onSiteHover={setSelectedNearbySiteId}
              />
            )}

            <NearbySitesSidebar
              sites={nearbySites}
              mode={nearbyMode}
              onModeChange={setNearbyMode}
              selectedSiteId={selectedNearbySiteId}
              onSiteSelect={setSelectedNearbySiteId}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
