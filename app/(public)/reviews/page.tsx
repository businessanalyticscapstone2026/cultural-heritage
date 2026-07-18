"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import { Star, Quote } from "lucide-react"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const reviews = [
  {
    name: "Maria Santos",
    role: "Heritage Advocate",
    rating: 5,
    text: "Batangas Heritage brought me back to my grandmother's stories. Walking through Balayan felt like stepping into a living museum.",
  },
  {
    name: "Jose Reyes",
    role: "Travel Blogger",
    rating: 5,
    text: "The curated trails saved us hours of planning. The Calatagan archaeological sites were jaw-dropping — every stop felt like a chapter from a history book.",
  },
  {
    name: "Elena Cruz",
    role: "History Teacher",
    rating: 5,
    text: "I bring my students here every semester. The depth of information is unmatched — it makes history come alive in ways no textbook ever could.",
  },
  {
    name: "Andre Villanueva",
    role: "Photographer",
    rating: 5,
    text: "The heritage sites here are incredibly photogenic. From the golden-hour light at the Basilica to the eerie beauty of Fortune Island ruins — every frame tells a story.",
  },
  {
    name: "Camille Dimaculangan",
    role: "Local Guide",
    rating: 4,
    text: "As a local, I thought I knew Batangas. This platform showed me hidden gems in my own town — a centuries-old watchtower I had walked past a hundred times.",
  },
  {
    name: "Rafael Mendoza",
    role: "Cultural Researcher",
    rating: 5,
    text: "The GIS mapping feature is brilliant. Being able to trace heritage corridors between municipalities gives a perspective that traditional guides simply cannot.",
  },
  {
    name: "Isabel Torres",
    role: "Solo Traveler",
    rating: 5,
    text: "I explored five municipalities in one weekend using the route planner. The recommended itineraries are thoughtful and respect the local communities.",
  },
  {
    name: "Daniel Aquino",
    role: "Urban Planner",
    rating: 4,
    text: "A invaluable resource for understanding how heritage conservation intersects with modern development. The documentation quality is exceptional.",
  },
]

export default function ReviewsPage() {
  return (
    <>
      <section className="bg-cream border-b border-ink/10 pt-0 md:pt-0">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Reviews
            </div>
            <h1 className="text-display text-5xl leading-[1] md:text-7xl">
              Stories from the <em className="italic text-accent">road.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
              Real experiences from heritage explorers, travelers, and community members
              who have walked the trails of Batangas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-parchment/30">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-10">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "4.8", label: "Average Rating" },
              { value: "2.4k", label: "Heritage Explorers" },
              { value: "850+", label: "Reviews Written" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-display text-3xl md:text-4xl text-ink">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink-soft">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 md:px-10 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-14"
        >
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> What People Say
          </div>
          <h2 className="text-display text-4xl leading-[1] md:text-5xl">
            Trusted by <em className="italic text-accent">explorers.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group rounded-2xl border border-ink/10 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-ink/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={
                        j < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-ink/20"
                      }
                    />
                  ))}
                </div>
                <Quote size={16} className="text-ink/10 transition-colors group-hover:text-accent/40" />
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                <div className="h-10 w-10 rounded-full bg-parchment" />
                <div>
                  <p className="text-sm font-medium text-ink">{review.name}</p>
                  <p className="text-xs text-ink-soft">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-3xl bg-ink px-8 py-20 text-center text-primary-foreground md:px-16 md:py-28"
        >
          <div className="relative">
            <div className="mx-auto mb-6 flex w-fit items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70">
              <span className="h-px w-8 bg-cream/60" /> Share Your Story
            </div>
            <h2 className="text-display text-4xl leading-[1] md:text-6xl">
              Been to Batangas?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-cream/70">
              Your review helps other travelers discover hidden heritage treasures
              and supports local communities.
            </p>
            <Link
              href="/explore"
              className="mt-8 inline-flex rounded-full bg-cream px-8 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream/90"
            >
              Write a Review
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
