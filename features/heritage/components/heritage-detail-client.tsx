"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import RestrictedLink from "@/components/auth/restricted-link"
import {
  Route,
  MapPin,
  Clock,
  Tag,
  ExternalLink,
  Share2,
  Star,
  Accessibility,
  Building,
  Landmark,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal"
import { sanitizeHtml } from "@/lib/sanitize-html"
import type { HeritageSite, HeritageSiteTag, HeritageSiteReferenceLink } from "../types"
import { BookmarkButton } from "./bookmark-button"
import NearbySitesSidebar from "./nearby-sites-sidebar"
import { ReviewsSection } from "@/features/reviews/components"
import { StarDisplay } from "@/features/reviews/components"
import type { NearbySite, TravelMode } from "@/types/heritage"

const Map = dynamic(() => import("@/components/ui/map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
      Loading map...
    </div>
  ),
})
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapMarker),
  { ssr: false },
)
const MarkerContent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerContent),
  { ssr: false },
)
const MapControls = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapControls),
  { ssr: false },
)

interface HeritageDetailClientProps {
  site: HeritageSite
  matchScore?: number
  initialIsBookmarked?: boolean
  nearbySites?: NearbySite[]
}

export default function HeritageDetailClient({
  site,
  matchScore,
  initialIsBookmarked = false,
  nearbySites = [],
}: HeritageDetailClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [nearbyMode, setNearbyMode] = useState<TravelMode>("walking")
  const [selectedNearbyId, setSelectedNearbyId] = useState<string | null>(null)

  const images = site.media.filter((m) => m.mediaType === "image")
  const hasCoordinates = site.latitude !== null && site.longitude !== null
  const locationParts = [site.barangay, site.municipalityName].filter(Boolean)

  const primaryIndex = Math.max(
    images.findIndex((m) => m.isPrimary),
    0,
  )
  const heroImageCount = images.length

  const [heroIndex, setHeroIndex] = useState(primaryIndex)
  const [heroAutoplayPaused, setHeroAutoplayPaused] = useState(false)

  const goToHero = useCallback(
    (index: number) => {
      if (heroImageCount === 0) return
      setHeroIndex(((index % heroImageCount) + heroImageCount) % heroImageCount)
    },
    [heroImageCount],
  )

  const heroNext = useCallback(() => goToHero(heroIndex + 1), [goToHero, heroIndex])
  const heroPrev = useCallback(() => goToHero(heroIndex - 1), [goToHero, heroIndex])

  useEffect(() => {
    if (heroImageCount <= 1 || heroAutoplayPaused) return
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImageCount)
    }, 4000)
    return () => clearInterval(id)
  }, [heroImageCount, heroAutoplayPaused, heroIndex])

  const hasHistory = site.historicalPeriod || site.yearEstablished || site.architectBuilder || site.architecturalStyle
  const hasSignificance = site.historicalSignificance || site.culturalSignificance

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
          prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : null,
        )
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : null,
        )
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex, images.length, closeLightbox])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }

  const mapsUrl = `https://www.google.com/maps?q=${site.latitude},${site.longitude}`

  return (
    <div className="min-h-screen bg-warm-white">
      {/* ═══════════════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 lg:px-10">
        <div
          className="relative h-[320px] overflow-hidden rounded-xl sm:h-[420px] lg:h-[520px]"
          onMouseEnter={() => setHeroAutoplayPaused(true)}
          onMouseLeave={() => setHeroAutoplayPaused(false)}
        >
          {heroImageCount > 0 ? (
            <motion.div
              className="absolute inset-0"
              drag={heroImageCount > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={() => setHeroAutoplayPaused(true)}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) heroNext()
                else if (info.offset.x > 60) heroPrev()
                setHeroAutoplayPaused(false)
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={images[heroIndex].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[heroIndex].fileUrl}
                    alt={images[heroIndex].caption ?? site.siteName}
                    fill
                    priority
                    draggable={false}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center">
                <Camera className="mx-auto h-10 w-10 text-muted-foreground/70" />
                <p className="mt-2 text-sm text-muted-foreground">No images available</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />

          {heroImageCount > 1 && (
            <>
              <button
                onClick={heroPrev}
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={heroNext}
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                {heroIndex + 1} / {heroImageCount}
              </div>

              <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => goToHero(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    aria-current={i === heroIndex}
                    className={`h-1.5 rounded-full transition-all ${
                      i === heroIndex ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 sm:p-8 sm:pb-14 lg:p-10 lg:pb-14">
            <div className="max-w-3xl space-y-3">
              {site.category && (
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/90">
                  {site.category.color && (
                    <span
                      className="size-2 shrink-0 rounded-full ring-1 ring-white/50"
                      style={{ backgroundColor: site.category.color }}
                      aria-hidden="true"
                    />
                  )}
                  {site.category.name}
                  <span className="text-white/50" aria-hidden="true">·</span>
                  <span>Cultural Heritage</span>
                </p>
              )}

              <div className="h-px w-12 bg-white/30" aria-hidden="true" />

              <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
                {site.siteName}
              </h1>

              {(locationParts.length > 0 || site.reviewCount > 0 || site.yearEstablished || matchScore !== undefined) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm text-white/90">
                  {locationParts.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {locationParts.join(", ")}
                    </span>
                  )}
                  {site.reviewCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <StarDisplay rating={site.averageRating} size="sm" />
                      <span>
                        {site.averageRating.toFixed(1)} &middot; {site.reviewCount} {site.reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </span>
                  )}
                  {site.yearEstablished && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Est. {site.yearEstablished}
                    </span>
                  )}
                  {matchScore !== undefined && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/25 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-white" />
                      {matchScore}% Match
                    </span>
                  )}
                </div>
              )}

              {site.shortDescription && (
                <p className="line-clamp-2 max-w-2xl pt-1 text-sm leading-relaxed text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
                  {site.shortDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. TWO-COLUMN LAYOUT
         ═══════════════════════════════════════════════════════ */}
      <div className="mx-auto mt-10 max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[3fr_2fr]">
          {/* ── MAIN CONTENT ── */}
          <div className="space-y-10">
            {/* Title row + actions */}
            <Reveal className="flex justify-end">
              <div className="flex shrink-0 items-center gap-2">
                <BookmarkButton siteId={site.id} initialIsBookmarked={initialIsBookmarked} />

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
            </Reveal>

            {heroImageCount > 1 && (
              <div className="flex flex-wrap gap-2">
                {images.slice(0, heroImageCount > 5 ? 5 : heroImageCount).map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => openLightbox(i)}
                    className="group relative aspect-[4/3] w-[calc(20%-8px)] min-w-[80px] overflow-hidden rounded-lg border border-border"
                    aria-label={`View photo ${i + 1}`}
                  >
                    <Image
                      src={img.fileUrl}
                      alt={img.caption ?? `Photo ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="20vw"
                    />
                  </button>
                ))}
                {heroImageCount > 5 && (
                  <button
                    onClick={() => openLightbox(0)}
                    className="flex aspect-[4/3] w-[calc(20%-8px)] min-w-[80px] items-center justify-center rounded-lg border border-border bg-muted text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                  >
                    +{heroImageCount - 5}
                  </button>
                )}
              </div>
            )}

            {/* ── HISTORY SECTION ── */}
            {hasHistory && (
              <Reveal>
                <section aria-labelledby="history-heading">
                <h2 id="history-heading" className="flex items-center gap-2 font-heading text-xl font-semibold text-heading">
                  <Building className="h-5 w-5 text-secondary" />
                  History
                </h2>
                <div className="mt-4 space-y-4">
                  {site.detailedDescription && (
                    <div
                      className="whitespace-pre-line text-justify text-sm leading-relaxed text-body hyphens-auto [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-accent [&_a]:underline"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(site.detailedDescription),
                      }}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {site.historicalPeriod && (
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Period</p>
                        <p className="mt-1 text-sm font-medium text-heading">{site.historicalPeriod}</p>
                      </div>
                    )}
                    {site.yearEstablished && (
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Established</p>
                        <p className="mt-1 text-sm font-medium text-heading">{site.yearEstablished}</p>
                      </div>
                    )}
                    {site.architectBuilder && (
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Architect / Builder</p>
                        <p className="mt-1 text-sm font-medium text-heading">{site.architectBuilder}</p>
                      </div>
                    )}
                    {site.architecturalStyle && (
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Architectural Style</p>
                        <p className="mt-1 text-sm font-medium text-heading">{site.architecturalStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
                </section>
              </Reveal>
            )}

            {/* ── SIGNIFICANCE SECTION ── */}
            {hasSignificance && (
              <Reveal>
                <section aria-labelledby="significance-heading">
                <h2 id="significance-heading" className="flex items-center gap-2 font-heading text-xl font-semibold text-heading">
                  <Landmark className="h-5 w-5 text-secondary" />
                  Significance
                </h2>
                <div className="mt-4 space-y-4">
                  {site.historicalSignificance && (
                    <div className="rounded-lg border-l-4 border-secondary/60 bg-card px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-secondary">Historical Significance</p>
                      <p className="mt-1 whitespace-pre-line text-justify text-sm leading-relaxed text-body hyphens-auto">{site.historicalSignificance}</p>
                    </div>
                  )}
                  {site.culturalSignificance && (
                    <div className="rounded-lg border-l-4 border-accent/60 bg-card px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-accent">Cultural Significance</p>
                      <p className="mt-1 whitespace-pre-line text-justify text-sm leading-relaxed text-body hyphens-auto">{site.culturalSignificance}</p>
                    </div>
                  )}
                </div>
                </section>
              </Reveal>
            )}

            {/* ── IMAGE GALLERY ── */}
            {images.length > 1 && (
              <Reveal>
                <section aria-labelledby="gallery-heading">
                <h2 id="gallery-heading" className="flex items-center gap-2 font-heading text-xl font-semibold text-heading">
                  <Camera className="h-5 w-5 text-secondary" />
                  Photo Gallery
                </h2>

                <Stagger className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img, i) => (
                    <StaggerItem key={img.id}>
                      <button
                        onClick={() => openLightbox(i)}
                        className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border"
                        aria-label={`View photo ${i + 1}${img.caption ? `: ${img.caption}` : ""}`}
                      >
                        <Image
                          src={img.fileUrl}
                          alt={img.caption ?? `Photo ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          loading={i < 6 ? "eager" : "lazy"}
                        />
                      </button>
                    </StaggerItem>
                  ))}
                </Stagger>
                </section>
              </Reveal>
            )}

            {/* ── ACCESSIBILITY ── */}
            {site.accessibilityInfo && (
              <Reveal>
                <section aria-labelledby="accessibility-heading">
                <h2 id="accessibility-heading" className="flex items-center gap-2 font-heading text-xl font-semibold text-heading">
                  <Accessibility className="h-5 w-5 text-secondary" />
                  Accessibility
                </h2>
                <div className="mt-4 rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-body">{site.accessibilityInfo}</p>
                </div>
                </section>
              </Reveal>
            )}

            {/* ── OPERATING HOURS ── */}
            {site.operatingHours && (
              <Reveal>
                <section aria-labelledby="hours-heading">
                <h2 id="hours-heading" className="flex items-center gap-2 font-heading text-xl font-semibold text-heading">
                  <Clock className="h-5 w-5 text-secondary" />
                  Operating Hours
                </h2>
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-body">{site.operatingHours}</p>
                </div>
                </section>
              </Reveal>
            )}

            {/* ── TAGS & REFERENCE LINKS ── */}
            {(site.tags.length > 0 || (site.referenceLinks?.length ?? 0) > 0) && (
              <Reveal>
                <section aria-labelledby="metadata-heading">
                <h2 id="metadata-heading" className="flex items-center gap-2 font-heading text-xl font-semibold text-heading">
                  <Tag className="h-5 w-5 text-secondary" />
                  Destination Info
                </h2>

                <div className="mt-4 space-y-4">
                  {site.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {site.tags.map((tag: HeritageSiteTag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {site.referenceLinks && site.referenceLinks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reference Links</p>
                      <ul className="space-y-1.5">
                        {site.referenceLinks.map((link: HeritageSiteReferenceLink) => (
                          <li key={link.id}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent/80"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {link.label ?? link.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                </section>
              </Reveal>
            )}

            {/* ── NEARBY ATTRACTIONS ── */}
            {nearbySites.length > 0 && (
              <Reveal>
                <NearbySitesSidebar
                  sites={nearbySites}
                  mode={nearbyMode}
                  onModeChange={setNearbyMode}
                  selectedSiteId={selectedNearbyId}
                  onSiteSelect={setSelectedNearbyId}
                />
              </Reveal>
            )}

            {/* ── FEEDBACK & REVIEWS ── */}
            <Reveal>
              <section aria-labelledby="reviews-heading">
                <ReviewsSection siteId={site.id} />
              </section>
            </Reveal>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Location Card */}
            <Reveal className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold text-heading">Location</h3>
              </div>

              {site.exactAddress && (
                <p className="mt-3 text-sm leading-relaxed text-body">{site.exactAddress}</p>
              )}

              {locationParts.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">{locationParts.join(", ")}</p>
              )}

              {hasCoordinates ? (
                <>
                  <div className="relative mt-4 h-48 w-full overflow-hidden rounded-lg border border-border">
                    <Map
                      className="h-full w-full"
                      center={[site.longitude!, site.latitude!]}
                      zoom={15}
                      theme="light"
                    >
                      <MapMarker longitude={site.longitude!} latitude={site.latitude!}>
                        <MarkerContent>
                          <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg">
                            <MapPin className="size-3.5 text-white" />
                          </div>
                        </MarkerContent>
                      </MapMarker>
                      <MapControls showZoom position="bottom-right" />
                    </Map>
                  </div>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in Google Maps
                  </a>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    {site.latitude!.toFixed(4)}, {site.longitude!.toFixed(4)}
                    {site.elevation && <> · Elev. {site.elevation}m</>}
                  </p>
                </>
              ) : (
                <div className="mt-4 flex h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Location not available</p>
                </div>
              )}
            </Reveal>

            {/* Quick Facts */}
            {(site.designation || site.entranceFee) && (
              <Reveal className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-heading">Quick Facts</h3>
                <div className="mt-3 space-y-3">
                  {site.designation && (
                    <div className="flex items-start gap-3">
                      <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Designation</p>
                        <p className="text-sm font-medium text-heading">{site.designation}</p>
                      </div>
                    </div>
                  )}
                  {site.entranceFee && (
                    <div className="flex items-start gap-3">
                      <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Entrance Fee</p>
                        <p className="text-sm font-medium text-heading">{site.entranceFee}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )}

            {/* Plan My Trip CTA */}
            {hasCoordinates && (
              <Reveal>
                <RestrictedLink
                  href={`/map?planRoute=${site.id}`}
                  title="Sign in to plan your trip"
                  description="Create a free account to build optimized heritage tour routes across Batangas."
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Route className="h-4 w-4" />
                  Plan My Trip
                </RestrictedLink>
              </Reveal>
            )}
          </aside>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          LIGHTBOX
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            role="dialog"
            aria-modal="true"
            aria-label="Photo lightbox"
          >
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
              autoFocus
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-[80vh] w-[90vw] max-w-5xl">
              <Image
                src={images[lightboxIndex].fileUrl}
                alt={images[lightboxIndex].caption ?? `Photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {lightboxIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    openLightbox(lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1)
                  }
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    openLightbox(lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0)
                  }
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
