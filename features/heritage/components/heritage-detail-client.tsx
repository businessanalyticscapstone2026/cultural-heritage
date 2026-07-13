"use client"

import { useState, useEffect, useCallback } from "react"
import type { HeritageSite, NearbySite } from "../types"
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

  const images = site.media.filter((m) => m.mediaType === "image")

  useEffect(() => {
    async function fetchNearby() {
      try {
        const res = await fetch(`/api/heritage?nearby=${site.id}`)
        if (res.ok) {
          const data = await res.json()
          setNearbySites(data.sites ?? [])
        }
      } catch {
        // Silently fail — nearby is optional
      }
    }

    fetchNearby()
  }, [site.id])

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

            <NearbySitesSidebar sites={nearbySites} />
          </aside>
        </div>
      </div>
    </div>
  )
}
