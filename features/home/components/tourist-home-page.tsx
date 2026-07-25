"use client"

import { useRef, useCallback } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, type Variants } from "motion/react"
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Map as MapIcon,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react"
import { CardBookmarkButton } from "@/features/bookmarks/components"
import { AtlasMapPreview } from "@/features/home/components/atlas-map-preview"
import { getCategoryIcon } from "@/features/home/components/category-icon"
import { TourismHighlightsSection } from "@/features/home/components/tourism-highlights-section"
import { trackRecommendationClickAction } from "@/features/recommendation/actions/click-track"
import type { HomePagePayload, TrendingSource } from "@/features/home/types"
import type { RecommendationResult } from "@/types/recommendation"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function truncate(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

function trendingEyebrow(source: TrendingSource): string {
  switch (source) {
    case "visits":
      return "Popular This Month"
    case "recommendation_clicks":
      return "Rising From Recommendations"
    case "combined_engagement":
      return "Trending Now"
    case "most_reviewed":
      return "Most Reviewed"
  }
}

function SiteImage({
  src,
  alt,
  className,
}: {
  src: string | null
  alt: string
  className?: string
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-parchment ${className ?? ""}`}
        aria-hidden
      >
        <MapIcon className="h-8 w-8 text-ink/20" strokeWidth={1.25} />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URLs
    <img src={src} alt={alt} className={className} loading="lazy" />
  )
}

interface TouristHomePageProps {
  data: HomePagePayload
}

export function TouristHomePage({ data }: TouristHomePageProps) {
  const {
    featuredSites,
    editorialHighlights,
    categories,
    trendingSites,
    trendingSource,
    mapPins,
    atlasStats,
    recommendedSites,
    recommendedResults,
    testimonials,
    heroImageUrl,
    userName,
    nearbySites,
    recentlyViewedSites,
  } = data

  const recById = new Map(recommendedResults.map((r) => [r.site.id, r]))

  const handleRecClick = useCallback((recId: string) => {
    trackRecommendationClickAction(recId)
  }, [])

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4])
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])

  return (
    <>
      {/* 1. Hero */}
      <section
        ref={heroRef}
        id="top"
        className="relative flex min-h-[100svh] w-full flex-col overflow-hidden pt-24 md:pt-20"
      >
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          {heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt=""
              className="h-[115%] w-full object-cover"
              width={1920}
              height={1280}
            />
          ) : (
            <div className="h-[115%] w-full bg-gradient-to-br from-parchment via-cream to-ink/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/40 to-cream" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream/60 via-transparent to-transparent" />
        </motion.div>

        <motion.div
          style={{ y: heroTextY }}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-8 md:px-10"
        >
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-4xl">
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-ink/70">
              <span className="h-px w-8 bg-ink/60" />
              First District of Batangas · Cultural Heritage Tourism
            </div>
            <h1 className="text-display text-[clamp(2.9rem,7.5vw,6.5rem)] leading-[0.95] text-ink">
              Walk through <em className="italic text-accent">history</em>,
              <br />
              one stone at a time.
            </h1>
            <p className="mt-8 max-w-xl text-base text-ink-soft md:text-lg">
              Discover cultural heritage destinations across the First District of Batangas.
              Curated routes, interactive maps, and stories carried by every facade, terrace,
              and shore.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="group rounded-full bg-ink px-8 py-3 text-sm text-primary-foreground transition hover:bg-accent"
              >
                Explore Heritage Sites
              </Link>
              <Link
                href="/map"
                className="group rounded-full border border-ink/25 bg-cream/60 px-8 py-3 text-sm text-ink backdrop-blur-md transition hover:bg-ink hover:text-primary-foreground"
              >
                Open GIS Map
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Personalized greeting */}
      {userName && (
        <section className="mx-auto max-w-7xl px-6 pt-8 pb-2 md:px-10">
          <p className="text-sm text-ink-soft">
            Welcome back, <span className="font-medium text-ink">{userName}</span>.
          </p>
        </section>
      )}

      <section className="border-y border-ink/10 bg-parchment/60 py-5 grain" aria-hidden>
        <div className="flex items-center gap-12 overflow-hidden whitespace-nowrap text-xs uppercase tracking-[0.35em] text-ink-soft">
          <MarqueeRow />
        </div>
      </section>

      {/* 2. Featured heritage sites */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-14 flex items-end justify-between gap-6"
        >
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Featured Heritage Sites
            </div>
            <h2 className="text-display text-5xl leading-[1] md:text-7xl">
              Places that <em className="italic text-accent">hold</em> a story.
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Hand-picked destinations that showcase the rich cultural tapestry of Batangas.
            </p>
          </div>
          <Link
            href="/explore"
            className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex"
          >
            View all sites{" "}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {featuredSites.length === 0 ? (
          <EmptyPanel
            title="No featured sites yet"
            description="When heritage sites are marked as featured and published, they will appear here."
            actionHref="/explore"
            actionLabel="Browse all sites"
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {featuredSites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link href={`/heritage/${site.id}`} className="group relative flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-parchment">
                    <SiteImage
                      src={site.imageUrl}
                      alt={site.siteName}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    {site.categoryName && (
                      <span
                        className="absolute left-3 top-3 rounded-full bg-cream/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur"
                        style={
                          site.categoryColor
                            ? { borderLeft: `3px solid ${site.categoryColor}` }
                            : undefined
                        }
                      >
                        {site.categoryName}
                      </span>
                    )}
                    <CardBookmarkButton siteId={site.id} />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-display text-xl leading-tight text-ink transition-colors group-hover:text-accent">
                        {site.siteName}
                      </h3>
                      <p className="text-sm text-ink-soft">
                        {site.municipalityName ?? "Batangas"}
                      </p>
                      {site.shortDescription && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-soft/90">
                          {site.shortDescription}
                        </p>
                      )}
                    </div>
                    {site.yearEstablished && (
                      <span className="shrink-0 font-mono text-xs text-accent">
                        {site.yearEstablished}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Tourism highlights (CR-CHTS-002) */}
      <TourismHighlightsSection highlights={editorialHighlights} />

      {/* 4. Explore by type */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-14"
        >
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> Categories
          </div>
          <h2 className="text-display text-5xl leading-[1] md:text-7xl">
            Explore by <em className="italic text-accent">type.</em>
          </h2>
          <p className="mt-4 max-w-lg text-ink-soft">
            Find the heritage experience that matches your interests — from sacred spaces to
            wild landscapes.
          </p>
        </motion.div>

        {categories.length === 0 ? (
          <EmptyPanel
            title="No categories available"
            description="Heritage categories will appear here when configured by administrators."
            actionHref="/explore"
            actionLabel="Browse sites"
          />
        ) : (
          <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 snap-x snap-mandatory">
            {categories.map((cat, i) => {
              const Icon = getCategoryIcon(cat.icon)
              const tint = cat.color ?? "#2E5BFF"
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="min-w-[240px] snap-start md:min-w-0"
                >
                  <Link
                    href={`/explore?category=${cat.id}`}
                    className="group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-ink/10 bg-ink"
                  >
                    <div
                      className="absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(to top, ${tint}ee, ${tint}99 45%, ${tint}55)`,
                      }}
                    />
                    <div className="relative p-6">
                      <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-cream/20 text-cream backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                        <Icon size={18} strokeWidth={1.4} />
                      </span>
                      <h3 className="text-display text-xl text-cream">{cat.name}</h3>
                      {cat.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-cream/80">
                          {cat.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-xs text-cream/70 transition-colors group-hover:text-cream">
                        <span>
                          {cat.siteCount}{" "}
                          {cat.siteCount === 1 ? "destination" : "destinations"}
                        </span>
                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* 5. Trending destinations */}
      <section className="border-y border-ink/10 bg-parchment/40 grain">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-14 flex items-end justify-between gap-6"
          >
            <div>
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-8 bg-accent" /> {trendingEyebrow(trendingSource)}
              </div>
              <h2 className="text-display text-5xl leading-[1] md:text-7xl">
                Trending <em className="italic text-accent">destinations.</em>
              </h2>
              <p className="mt-4 max-w-md text-ink-soft">
                {trendingSource === "most_reviewed"
                  ? "Engagement data is still light — showing the most-reviewed published sites."
                  : "The sites travelers are exploring most right now."}
              </p>
            </div>
            <Link
              href="/explore"
              className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex"
            >
              View all{" "}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {trendingSites.length === 0 ? (
            <EmptyPanel
              title="No trending sites yet"
              description="Visit and review activity will surface popular destinations here."
              actionHref="/explore"
              actionLabel="Start exploring"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {trendingSites.map((site, i) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link
                    href={`/heritage/${site.id}`}
                    className="group flex items-center gap-5 rounded-2xl border border-ink/10 bg-card p-4 transition-all hover:border-ink/20 hover:shadow-lg"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-parchment">
                      <SiteImage
                        src={site.imageUrl}
                        alt={site.siteName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {site.categoryName && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                          {site.categoryName}
                        </span>
                      )}
                      <h3 className="mt-1 truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                        {site.siteName}
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {site.municipalityName ?? "Batangas"}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
                        {(site.averageRating ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            {Number(site.averageRating).toFixed(1)}
                          </span>
                        )}
                        {site.metricValue != null && site.metricLabel && (
                          <>
                            {(site.averageRating ?? 0) > 0 && (
                              <span className="h-1 w-1 rounded-full bg-ink/20" />
                            )}
                            <span>
                              {site.metricValue} {site.metricLabel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Interactive heritage atlas preview */}
      <section className="relative overflow-hidden bg-ink text-primary-foreground">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-ink via-ink/90 to-ink" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70">
                <span className="h-px w-8 bg-cream/60" /> Interactive GIS Atlas
              </div>
              <h2 className="text-display text-5xl leading-[1] md:text-7xl">
                A map that <em className="italic text-cream/80">remembers</em> every road taken.
              </h2>
              <p className="mt-6 max-w-sm text-cream/70">
                Heritage sites across Batangas 1st District — open the full map for filters,
                routes, and site details.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-cream/15 pt-8">
                <Stat n={String(atlasStats.heritageSiteCount)} label="Heritage sites" />
                <Stat n={String(atlasStats.municipalityCount)} label="Municipalities" />
                <Stat n={String(atlasStats.publishedReviewCount)} label="Reviews" />
              </div>
              <Link
                href="/map"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm text-ink transition hover:bg-accent hover:text-primary-foreground"
              >
                Open Full Map{" "}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <AtlasMapPreview pins={mapPins} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Recommended destinations */}
      <section
        id="recommended"
        className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32"
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-14 flex items-end justify-between gap-6"
        >
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Recommended for You
            </div>
            <h2 className="text-display text-5xl leading-[1] md:text-7xl">
              Explore <em className="italic text-accent">your</em> matches.
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Personalized heritage picks based on your interests, location, and popularity.
            </p>
          </div>
          <Link
            href="/explore"
            className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex"
          >
            Browse all sites{" "}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {recommendedSites.length === 0 ? (
          <EmptyPanel
            title="No recommendations yet"
            description="Set your interests in your profile or start exploring to get personalized suggestions."
            actionHref="/explore"
            actionLabel="Explore sites"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedSites.map((site, i) => {
              const rec = recById.get(site.id)
              return (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                >
                  <Link
                    href={`/heritage/${site.id}`}
                    onClick={() => {
                      if (rec?.recommendationId) handleRecClick(rec.recommendationId)
                    }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SiteImage
                        src={site.imageUrl}
                        alt={site.siteName}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                      />
                      {site.categoryName && (
                        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">
                          {site.categoryName}
                        </span>
                      )}
                      {rec && (
                        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-accent/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
                          <Sparkles size={10} strokeWidth={1.5} />
                          {rec.matchPercentage}% Match
                        </span>
                      )}
                      <CardBookmarkButton siteId={site.id} />
                    </div>
                    <div className="p-5">
                      <h3 className="text-display text-lg leading-tight text-ink transition-colors group-hover:text-accent">
                        {site.siteName}
                      </h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        {site.municipalityName ?? "Batangas"}
                      </p>
                      {rec && rec.reasons.length > 0 && (
                        <p className="mt-1 text-xs text-ink-soft/80 line-clamp-1">
                          {rec.reasons[0]}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs text-ink-soft">
                            {(site.averageRating ?? 0) > 0
                              ? Number(site.averageRating).toFixed(1)
                              : "—"}
                            {site.yearEstablished ? ` · ${site.yearEstablished}` : ""}
                          </span>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* 8. Nearby Destinations */}
      {nearbySites.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-14 flex items-end justify-between gap-6"
          >
            <div>
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-8 bg-accent" /> Nearby Destinations
              </div>
              <h2 className="text-display text-5xl leading-[1] md:text-7xl">
                Close to <em className="italic text-accent">you.</em>
              </h2>
              <p className="mt-4 max-w-md text-ink-soft">
                Heritage sites near your home location, ready to explore.
              </p>
            </div>
            <Link
              href="/nearby"
              className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex"
            >
              View all{" "}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {nearbySites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  href={`/heritage/${site.id}`}
                  className="group flex items-center gap-5 rounded-2xl border border-ink/10 bg-card p-4 transition-all hover:border-ink/20 hover:shadow-lg"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-parchment">
                    <SiteImage
                      src={site.imageUrl}
                      alt={site.siteName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {site.categoryName && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        {site.categoryName}
                      </span>
                    )}
                    <h3 className="mt-1 truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                      {site.siteName}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {site.municipalityName ?? "Batangas"}
                    </p>
                  </div>
                  <MapPin
                    size={16}
                    className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Recently Viewed */}
      {recentlyViewedSites.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-14 flex items-end justify-between gap-6"
          >
            <div>
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-8 bg-accent" /> Recently Viewed
              </div>
              <h2 className="text-display text-5xl leading-[1] md:text-7xl">
                Pick up where you <em className="italic text-accent">left off.</em>
              </h2>
              <p className="mt-4 max-w-md text-ink-soft">
                Sites you recently explored — dive back in.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recentlyViewedSites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  href={`/heritage/${site.id}`}
                  className="group flex items-center gap-5 rounded-2xl border border-ink/10 bg-card p-4 transition-all hover:border-ink/20 hover:shadow-lg"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-parchment">
                    <SiteImage
                      src={site.imageUrl}
                      alt={site.siteName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {site.categoryName && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        {site.categoryName}
                      </span>
                    )}
                    <h3 className="mt-1 truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                      {site.siteName}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {site.municipalityName ?? "Batangas"}
                    </p>
                  </div>
                  <Clock
                    size={16}
                    className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 10. Testimonials */}
      <section className="border-y border-ink/10 bg-parchment/50 grain">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-14 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Testimonials
            </div>
            <h2 className="text-display text-5xl leading-[1] md:text-7xl">
              Travelers <em className="italic text-accent">love</em> this.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-soft">
              Stories from the road — real experiences from heritage explorers.
            </p>
          </motion.div>

          {testimonials.length === 0 ? (
            <EmptyPanel
              title="No traveler stories yet"
              description="Approved reviews with a rating of 4 or higher will show up here. Be the first to share your visit."
              actionHref="/explore"
              actionLabel="Find a site to review"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="rounded-2xl border border-ink/10 bg-card p-6 transition-all duration-300 hover:border-ink/20 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className={
                          j < t.rating ? "fill-amber-400 text-amber-400" : "text-ink/20"
                        }
                      />
                    ))}
                  </div>
                  {t.comment ? (
                    <p className="text-sm leading-relaxed text-ink-soft">
                      &ldquo;{truncate(t.comment, 200)}&rdquo;
                    </p>
                  ) : (
                    <p className="text-sm italic text-ink-soft/70">Rated this site highly.</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-parchment text-xs font-medium text-ink">
                      {t.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{t.reviewerName}</p>
                      <Link
                        href={`/heritage/${t.siteId}`}
                        className="truncate text-xs text-ink-soft transition-colors hover:text-accent"
                      >
                        {t.siteName}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-44">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-3xl bg-ink px-8 py-20 text-center text-primary-foreground md:px-16 md:py-32"
        >
          <div className="relative">
            <div className="mx-auto mb-6 flex w-fit items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70">
              <span className="h-px w-8 bg-cream/60" /> Start Your Journey
            </div>
            <h2 className="mx-auto max-w-3xl text-display text-5xl leading-[1] md:text-7xl">
              Carry the <em className="italic">archive</em> in your pocket.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-cream/70">
              Explore the First District of Batangas with curated routes, smart recommendations,
              and interactive maps.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/explore"
                className="group rounded-full bg-cream px-8 py-3 text-sm font-medium text-ink transition hover:bg-accent hover:text-primary-foreground"
              >
                Start Exploring
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-cream/30 px-8 py-3 text-sm text-cream/90 transition hover:border-cream"
              >
                Create free account
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  )
}

function EmptyPanel({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-card/50 px-8 py-14 text-center">
      <p className="text-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-ink"
      >
        {actionLabel} <ArrowRight size={14} />
      </Link>
    </div>
  )
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-display text-4xl text-cream md:text-5xl">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-cream/60">{label}</div>
    </div>
  )
}

function MarqueeRow() {
  const items = [
    "Balayan",
    "Calatagan",
    "Nasugbu",
    "Lian",
    "Tuy",
    "Calaca",
    "Lemery",
    "Taal",
    "First District · Living Culture",
  ]
  return (
    <div className="flex animate-[marquee_40s_linear_infinite] gap-12">
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center gap-12">
          {t}
          <span className="h-1 w-1 rounded-full bg-accent" />
        </span>
      ))}
      <style>{`@keyframes marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }`}</style>
    </div>
  )
}
