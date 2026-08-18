"use client"

import { Fragment } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { fadeUp } from "@/lib/motion-variants"
import { ArrowRight, Calendar, Megaphone } from "lucide-react"
import type { HomeAnnouncement } from "@/features/home/types"

function truncate(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

function formatEventDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function categoryStyle(category: string | null): {
  className: string
  Icon: typeof Calendar
  label: string
} {
  const cat = (category ?? "").toLowerCase()
  if (cat.includes("festival")) {
    return { className: "bg-amber-500/90", Icon: Calendar, label: category ?? "Festival" }
  }
  if (cat.includes("announcement")) {
    return { className: "bg-emerald-500/90", Icon: Megaphone, label: category ?? "Announcement" }
  }
  return { className: "bg-blue-500/90", Icon: Calendar, label: category ?? "Event" }
}

function CategoryPill({ category }: { category: string | null }) {
  const { className, Icon, label } = categoryStyle(category)
  return (
    <span
      className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur ${className}`}
    >
      <Icon size={10} />
      {label}
    </span>
  )
}

function EventImage({
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
        <Calendar className="h-10 w-10 text-ink/15" strokeWidth={1.25} />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage / local asset URLs
    <img src={src} alt={alt} className={className} loading="lazy" />
  )
}

function EventMeta({
  date,
  location,
}: {
  date: string | null
  location: string | null
}) {
  const parts = [date ? formatEventDate(date) : null, location].filter(Boolean)
  if (parts.length === 0) return null
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cream/75">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="h-1 w-1 rounded-full bg-cream/40" aria-hidden="true" />}
          <span>{part}</span>
        </Fragment>
      ))}
    </div>
  )
}

function LearnMore({ linkUrl }: { linkUrl: string | null }) {
  const classes =
    "mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cream transition-colors group-hover:text-accent"
  const arrow = (
    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
  )

  if (linkUrl) {
    const external = linkUrl.startsWith("http")
    return (
      <Link
        href={linkUrl}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={classes}
      >
        Learn more
        {arrow}
      </Link>
    )
  }
  return (
    <span className={classes}>
      Learn more
      {arrow}
    </span>
  )
}

interface DistrictEventsSectionProps {
  announcements: HomeAnnouncement[]
}

/**
 * CHT-092 — "What's happening in the district": 1 featured event card
 * (≈55% width) + 2 stacked horizontal cards on the right. Rendered from
 * published announcements with a curated fallback when none exist.
 */
export function DistrictEventsSection({ announcements }: DistrictEventsSectionProps) {
  const [featured, second, third] = announcements
  const hasStack = Boolean(second || third)

  return (
    <section
      id="whats-happening"
      className="border-y border-ink/10 bg-parchment/40 grain"
      aria-label="What's happening in the district"
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
            <span className="h-px w-8 bg-accent" /> Events &amp; Announcements
          </div>
          <h2 className="text-display text-5xl leading-[1] md:text-7xl">
            What&rsquo;s <em className="italic text-accent">happening</em> in the district.
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">
            Festivals, heritage walks, and cultural events happening across the five
            municipalities.
          </p>
        </motion.div>

        {!featured ? (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-card/60 px-8 py-14 text-center">
            <p className="text-display text-xl text-ink">No events yet</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">
              Upcoming festivals, heritage walks, and announcements will appear here as
              they&rsquo;re published.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 ${
              hasStack ? "md:grid-cols-[1.15fr_1fr] md:grid-rows-2" : ""
            }`}
          >
            {/* Featured event card */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={`group relative min-h-[380px] overflow-hidden rounded-3xl bg-ink md:min-h-[480px] ${
                hasStack ? "md:row-span-2" : ""
              }`}
            >
              <EventImage
                src={featured.imageUrl}
                alt={featured.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
              <div className="relative flex h-full min-h-[380px] flex-col justify-end p-8 md:min-h-[480px] md:p-10">
                <CategoryPill category={featured.category} />
                <h3 className="text-display text-3xl text-cream md:text-4xl">
                  {featured.title}
                </h3>
                {featured.body && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/85 md:text-base">
                    {truncate(featured.body, 180)}
                  </p>
                )}
                <EventMeta date={featured.eventDate} location={featured.municipalityName} />
                <LearnMore linkUrl={featured.linkUrl} />
              </div>
            </motion.article>

            {/* Stacked supporting cards */}
            {second && (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="group relative min-h-[240px] overflow-hidden rounded-3xl bg-ink md:min-h-0 md:row-span-1"
              >
                <EventImage
                  src={second.imageUrl}
                  alt={second.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/50 to-ink/10" />
                <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6 md:min-h-0 md:p-8">
                  <CategoryPill category={second.category} />
                  <h3 className="text-display text-2xl text-cream">{second.title}</h3>
                  <EventMeta date={second.eventDate} location={second.municipalityName} />
                </div>
              </motion.article>
            )}

            {third && (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="group relative min-h-[240px] overflow-hidden rounded-3xl bg-ink md:min-h-0 md:row-span-1"
              >
                <EventImage
                  src={third.imageUrl}
                  alt={third.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/50 to-ink/10" />
                <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6 md:min-h-0 md:p-8">
                  <CategoryPill category={third.category} />
                  <h3 className="text-display text-2xl text-cream">{third.title}</h3>
                  <EventMeta date={third.eventDate} location={third.municipalityName} />
                </div>
              </motion.article>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
