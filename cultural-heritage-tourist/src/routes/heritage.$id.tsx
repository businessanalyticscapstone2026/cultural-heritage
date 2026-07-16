import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Clock,
  Tag,
  Star,
  Bookmark,
  Share2,
  ChevronLeft,
  Accessibility,
  Phone,
  Globe,
  ExternalLink,
  Heart,
  MessageCircle,
  Navigation,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/heritage/$id")({
  component: HeritageDetailsPage,
});

const heritageSites: Record<
  string,
  {
    id: string;
    name: string;
    municipality: string;
    category: string;
    era: string;
    rating: number;
    reviewCount: number;
    description: string;
    longDescription: string;
    images: string[];
    accessibility: string[];
    facilities: string[];
    operatingHours: string;
    contact: string;
    website: string;
    coordinates: [number, number];
    nearbyAttractions: {
      id: string;
      name: string;
      distance: string;
      category: string;
    }[];
    reviews: { author: string; date: string; rating: number; text: string }[];
  }
> = {
  "basilica-martin": {
    id: "basilica-martin",
    name: "Basilica of St. Martin de Tours",
    municipality: "Balayan",
    category: "Sacred",
    era: "1575",
    rating: 4.8,
    reviewCount: 124,
    description: "One of the oldest churches in the Philippines.",
    longDescription:
      "Originally built by the Augustinians in 1575, the Basilica of St. Martin de Tours stands as one of the oldest stone churches in the Philippines. The current structure, rebuilt in the 19th century, houses centuries-old religious artifacts including a silver tabernacle and ivory santos. The church survived the Philippine Revolution and both World Wars, serving as a silent witness to Batangas' rich colonial history. Its massive stone walls and baroque interior decorations make it a must-visit for heritage enthusiasts.",
    images: ["/dest-1.jpg", "/dest-2.jpg", "/dest-3.jpg"],
    accessibility: [
      "Wheelchair accessible",
      "Guided tours available",
      "Self-guided visits",
    ],
    facilities: ["Restrooms", "Gift shop", "Parking", "Tourist information"],
    operatingHours: "Mon-Sun: 6:00 AM - 6:00 PM",
    contact: "+63 43 123 4567",
    website: "https://example.com",
    coordinates: [13.9372, 120.7315],
    nearbyAttractions: [
      {
        id: "balayan-heritage-houses",
        name: "Balayan Heritage Houses",
        distance: "0.3 km",
        category: "Colonial",
      },
      {
        id: "calatagan-archaeological",
        name: "Calatagan Archaeological Site",
        distance: "12.5 km",
        category: "UNESCO",
      },
      {
        id: "calatagan-ruins",
        name: "Calatagan Ruins",
        distance: "13.2 km",
        category: "Colonial",
      },
    ],
    reviews: [
      {
        author: "Maria S.",
        date: "2025-12-15",
        rating: 5,
        text: "Absolutely stunning church with incredible history. The guided tour was very informative.",
      },
      {
        author: "Juan D.",
        date: "2025-11-20",
        rating: 4,
        text: "Beautiful architecture and peaceful atmosphere. The baroque details are remarkable.",
      },
      {
        author: "Ana R.",
        date: "2025-10-05",
        rating: 5,
        text: "A must-visit when in Batangas. The church has been lovingly preserved.",
      },
    ],
  },
  "calatagan-archaeological": {
    id: "calatagan-archaeological",
    name: "Calatagan Archaeological Site",
    municipality: "Calatagan",
    category: "UNESCO",
    era: "1300",
    rating: 4.6,
    reviewCount: 87,
    description: "UNESCO-listed archaeological site with pre-colonial artifacts.",
    longDescription:
      "The Calatagan Archaeological Site is a UNESCO World Heritage candidate that showcases a wealth of pre-colonial artifacts dating back to the 14th century. Excavations have uncovered burial jars, trade ceramics, gold ornaments, and other cultural objects that reveal the sophisticated society that existed before Spanish colonization. The site provides invaluable insights into the early trade networks connecting the Philippines to China, Japan, and Southeast Asia.",
    images: ["/dest-2.jpg", "/dest-1.jpg", "/dest-4.jpg"],
    accessibility: ["Wheelchair accessible", "Guided tours available"],
    facilities: ["Restrooms", "Museum", "Parking"],
    operatingHours: "Tue-Sun: 8:00 AM - 5:00 PM",
    contact: "+63 43 722 0000",
    website: "https://example.com",
    coordinates: [13.8856, 120.7401],
    nearbyAttractions: [
      {
        id: "calatagan-ruins",
        name: "Calatagan Ruins",
        distance: "0.8 km",
        category: "Colonial",
      },
      {
        id: "basilica-martin",
        name: "Basilica of St. Martin de Tours",
        distance: "12.5 km",
        category: "Sacred",
      },
    ],
    reviews: [
      {
        author: "Dr. Reyes",
        date: "2025-09-10",
        rating: 5,
        text: "A treasure trove of Philippine history. The artifacts are world-class.",
      },
      {
        author: "Elena T.",
        date: "2025-08-22",
        rating: 4,
        text: "Very educational. The guides are knowledgeable and passionate about the site.",
      },
    ],
  },
};

const fallbackSite = {
  id: "unknown",
  name: "Heritage Site",
  municipality: "Batangas",
  category: "Colonial",
  era: "1900",
  rating: 4.0,
  reviewCount: 0,
  description: "A heritage site in Batangas Province.",
  longDescription:
    "This is a heritage site in Batangas Province, Philippines. Detailed information about this site is currently being compiled by our heritage team. Please check back later for a full description, history, and visitor information.",
  images: ["/dest-1.jpg", "/dest-2.jpg"],
  accessibility: ["Self-guided visits"],
  facilities: ["Parking"],
  operatingHours: "Mon-Sun: 8:00 AM - 5:00 PM",
  contact: "",
  website: "",
  coordinates: [13.9, 120.7],
  nearbyAttractions: [],
  reviews: [],
};

function HeritageDetailsPage() {
  const { id } = Route.useParams();
  const site = heritageSites[id] ?? { ...fallbackSite, id };
  const [activeImage, setActiveImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <Navbar />

      {/* Breadcrumb */}
      <section className="bg-cream pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Explore
          </Link>
        </div>
      </section>

      {/* Hero image gallery */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-parchment"
          >
            <img
              src={site.images[activeImage] ?? site.images[0]}
              alt={site.name}
              className="h-full w-full object-cover"
              width={1920}
              height={1080}
            />
            <span className="absolute left-4 top-4 rounded-full bg-cream/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">
              {site.category}
            </span>
          </motion.div>

          {site.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {site.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-video w-1/3 overflow-hidden rounded-xl bg-parchment transition-all ${
                    i === activeImage
                      ? "ring-2 ring-accent"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${site.name} photo ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_350px]">
          {/* Left column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-display text-4xl text-ink md:text-5xl">
                {site.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {site.municipality}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Est. {site.era}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  {site.category}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(site.rating)
                          ? "fill-accent text-accent"
                          : "fill-ink/10 text-ink/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-ink-soft">
                  {site.rating} ({site.reviewCount} reviews)
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
                    bookmarked
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-ink/15 bg-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${bookmarked ? "fill-accent" : ""}`}
                  />
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-transparent px-4 py-2.5 text-sm text-ink-soft transition hover:text-ink">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </motion.div>

            <div className="my-10 h-px bg-ink/10" />

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-display text-2xl text-ink">
                About this site
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                {site.longDescription}
              </p>
            </motion.div>

            <div className="my-10 h-px bg-ink/10" />

            {/* Accessibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-display text-2xl text-ink">Accessibility</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {site.accessibility.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-ink/15 bg-parchment/50 px-3 py-1 text-xs text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="my-10 h-px bg-ink/10" />

            {/* Facilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <h2 className="text-display text-2xl text-ink">Facilities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {site.facilities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-ink/15 bg-parchment/50 px-3 py-1 text-xs text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="my-10 h-px bg-ink/10" />

            {/* Operating Hours & Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-sm text-ink-soft">
                <Clock className="h-4 w-4 shrink-0" />
                {site.operatingHours}
              </div>
              {site.contact && (
                <div className="flex items-center gap-3 text-sm text-ink-soft">
                  <Phone className="h-4 w-4 shrink-0" />
                  {site.contact}
                </div>
              )}
              {site.website && (
                <a
                  href={site.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-accent transition-colors hover:text-ink"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  Visit website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </motion.div>

            <div className="my-10 h-px bg-ink/10" />

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <h2 className="text-display text-2xl text-ink">Reviews</h2>

              <div className="mt-6 space-y-4">
                {site.reviews.map((review, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-ink/10 bg-card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-ink">
                          {review.author}
                        </span>
                        <span className="ml-3 text-xs text-ink-soft">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-3 w-3 ${
                              j < review.rating
                                ? "fill-accent text-accent"
                                : "fill-ink/10 text-ink/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Leave a review */}
              <div className="mt-8 rounded-2xl border border-ink/10 bg-card p-6">
                <h3 className="text-display text-lg text-ink">
                  Leave a Review
                </h3>
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setReviewRating(i + 1)}>
                      <Star
                        className={`h-5 w-5 transition ${
                          i < reviewRating
                            ? "fill-accent text-accent"
                            : "fill-ink/10 text-ink/10"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  className="mt-4 w-full rounded-xl border border-ink/15 bg-cream/50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-accent"
                />
                <button className="mt-4 rounded-xl bg-ink px-6 py-2.5 text-sm text-primary-foreground transition hover:bg-accent">
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Location card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border border-ink/10 bg-card p-6"
            >
              <h3 className="text-display text-lg text-ink">Location</h3>
              <p className="mt-2 font-mono text-xs text-ink-soft">
                {site.coordinates[0]}, {site.coordinates[1]}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${site.coordinates[0]},${site.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-primary-foreground transition hover:bg-accent"
                >
                  <Navigation className="h-4 w-4" />
                  Start Navigation
                </a>
                <a
                  href={`https://www.google.com/maps?q=${site.coordinates[0]},${site.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink-soft transition hover:text-ink"
                >
                  <MapPin className="h-4 w-4" />
                  View on Map
                </a>
              </div>
            </motion.div>

            {/* Nearby Attractions */}
            {site.nearbyAttractions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="rounded-2xl border border-ink/10 bg-card p-6"
              >
                <h3 className="text-display text-lg text-ink">
                  Nearby Attractions
                </h3>
                <div className="mt-4 space-y-3">
                  {site.nearbyAttractions.map((attraction) => (
                    <Link
                      key={attraction.id}
                      to="/heritage/$id"
                      params={{ id: attraction.id }}
                      className="group flex items-start justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-parchment/50"
                    >
                      <div>
                        <span className="text-sm font-medium text-ink group-hover:text-accent">
                          {attraction.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {attraction.distance} · {attraction.category}
                        </span>
                      </div>
                      <ChevronLeft className="mt-0.5 h-4 w-4 rotate-180 text-ink-soft group-hover:text-accent" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Similar Destinations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl border border-ink/10 bg-card p-6"
            >
              <h3 className="text-display text-lg text-ink">
                Similar Destinations
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  {
                    id: "balayan-heritage-houses",
                    name: "Balayan Heritage Houses",
                    category: "Colonial",
                  },
                  {
                    id: "calatagan-ruins",
                    name: "Calatagan Ruins",
                    category: "Colonial",
                  },
                  {
                    id: "fortune-island",
                    name: "Fortune Island Ruins",
                    category: "Colonial",
                  },
                ]
                  .filter((s) => s.id !== id)
                  .slice(0, 3)
                  .map((similar) => (
                    <Link
                      key={similar.id}
                      to="/heritage/$id"
                      params={{ id: similar.id }}
                      className="group flex items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-parchment/50"
                    >
                      <div>
                        <span className="text-sm font-medium text-ink group-hover:text-accent">
                          {similar.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {similar.category}
                        </span>
                      </div>
                      <ChevronLeft className="h-4 w-4 rotate-180 text-ink-soft group-hover:text-accent" />
                    </Link>
                  ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
