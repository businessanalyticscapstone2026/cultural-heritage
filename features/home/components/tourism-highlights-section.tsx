"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import { ArrowRight, BookOpen, Map as MapIcon, MapPin } from "lucide-react"
import { HighlightsMapPreview } from "@/features/home/components/highlights-map-preview"
import type { HomeEditorialHighlight } from "@/features/home/types"

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

function narrativeLabel(kind: HomeEditorialHighlight["narrativeKind"]): string {
  return kind === "historical" ? "Historical significance" : "Cultural significance"
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
        <BookOpen className="h-10 w-10 text-ink/15" strokeWidth={1.25} />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URLs
    <img src={src} alt={alt} className={className} loading="lazy" />
  )
}

function HighlightCtas({ site }: { site: HomeEditorialHighlight }) {
  const mapHref =
    site.latitude != null && site.longitude != null
      ? `/map?site=${site.id}`
      : "/map"

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href={`/heritage/${site.id}`}
        className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-accent hover:text-primary-foreground"
      >
        View full details
        <ArrowRight size={14} />
      </Link>
      <Link
        href={mapHref}
        className="inline-flex items-center gap-2 rounded-full border border-cream/35 bg-transparent px-5 py-2.5 text-sm text-cream transition hover:border-cream hover:bg-cream/10"
      >
        <MapIcon size={14} />
        View on map
      </Link>
    </div>
  )
}

interface TourismHighlightsSectionProps {
  highlights: HomeEditorialHighlight[]
}

/**
 * CR-CHTS-002 — editorial tourism highlights (narrative-rich heritage sites).
 * Not a uniform card grid: 1 large feature + optional supporting feature + scoped map.
 */
export function TourismHighlightsSection({ highlights }: TourismHighlightsSectionProps) {
  const primary = highlights[0] ?? null
  const secondary = highlights[1] ?? null

  return (
    <section
      id="tourism-highlights"
      className="border-y border-ink/10 bg-parchment/40 grain"
      aria-label="Tourism highlights"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-14"
        >
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> Tourism Highlights
          </div>
          <h2 className="text-display text-5xl leading-[1] md:text-7xl">
            Stories that <em className="italic text-accent">define</em> the district.
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">
            Editorially featured places with documented historical and cultural significance —
            not just a pin on the map.
          </p>
        </motion.div>

        {!primary ? (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-card/60 px-8 py-14 text-center">
            <p className="text-display text-xl text-ink">No narrative highlights yet</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">
              When published sites include substantial historical or cultural significance text,
              they will be featured here in an editorial layout.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-ink"
            >
              Browse all sites <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Primary feature + scoped map */}
            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group relative min-h-[420px] overflow-hidden rounded-3xl bg-ink"
              >
                <SiteImage
                  src={primary.imageUrl}
                  alt={primary.siteName}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
                <div className="relative flex h-full min-h-[420px] flex-col justify-end p-8 md:p-10">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur">
                      <BookOpen size={10} />
                      {narrativeLabel(primary.narrativeKind)}
                    </span>
                    {primary.categoryName && (
                      <span className="rounded-full bg-cream/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur">
                        {primary.categoryName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-display text-3xl text-cream md:text-4xl">
                    {primary.siteName}
                  </h3>
                  <p className="mt-1 text-sm text-cream/70">
                    {[primary.municipalityName, primary.yearEstablished]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/85 md:text-base">
                    {truncate(primary.narrative, 320)}
                  </p>
                  <HighlightCtas site={primary} />
                </div>
              </motion.article>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="flex min-h-[320px] flex-col gap-4 lg:min-h-0"
              >
                <HighlightsMapPreview sites={highlights} className="min-h-[280px] flex-1" />
                <div className="rounded-2xl border border-ink/10 bg-card px-4 py-3">
                  <p className="flex items-start gap-2 text-xs text-ink-soft">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-accent" />
                    {highlights.filter((h) => h.latitude != null).length > 0
                      ? `Showing ${highlights.filter((h) => h.latitude != null).length === 1 ? "this site" : "these sites"} on a scoped map. Open the full GIS atlas for filters and routes.`
                      : "Coordinates missing for highlighted sites — map pins appear once lat/long are set."}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Supporting feature (only when a second narrative-rich site qualifies) */}
            {secondary && (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.12 }}
                className="grid overflow-hidden rounded-3xl border border-ink/10 bg-card md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              >
                <div className="relative min-h-[240px] md:min-h-[300px]">
                  <SiteImage
                    src={secondary.imageUrl}
                    alt={secondary.siteName}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                      <BookOpen size={10} />
                      {narrativeLabel(secondary.narrativeKind)}
                    </span>
                    {secondary.categoryName && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                        {secondary.categoryName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-display text-2xl text-ink md:text-3xl">
                    {secondary.siteName}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {[secondary.municipalityName, secondary.yearEstablished]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-[15px]">
                    {truncate(secondary.narrative, 280)}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/heritage/${secondary.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-accent"
                    >
                      View full details
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href={
                        secondary.latitude != null && secondary.longitude != null
                          ? `/map?site=${secondary.id}`
                          : "/map"
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink transition hover:border-ink hover:bg-parchment"
                    >
                      <MapIcon size={14} />
                      View on map
                    </Link>
                  </div>
                </div>
              </motion.article>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
