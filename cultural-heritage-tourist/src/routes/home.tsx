import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { lazy, Suspense, useRef, useState } from "react";
import heroImg from "@/assets/hero-heritage.jpg";
import dest1 from "@/assets/dest-1.jpg";
import dest2 from "@/assets/dest-2.jpg";
import dest3 from "@/assets/dest-3.jpg";
import dest4 from "@/assets/dest-4.jpg";
import mapTexture from "@/assets/map-texture.jpg";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthPrompt } from "@/components/AuthPrompt";
import { useAuth } from "@/lib/auth";
import { getTrendingSites, type TrendingSite } from "@/lib/trending";
import { Church, Landmark, TreePine, BookOpen, MapPin, Calendar, Megaphone, Star, ChevronRight, ArrowRight, Compass, Map as MapIcon, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/home")({
  loader: () => getTrendingSites(),
  component: HomePage,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

const featuredSites = [
  { img: dest1, name: "Basilica of St. Martin de Tours", municipality: "Balayan", era: "1575", category: "Sacred", id: "basilica-martin", rating: 4.8 },
  { img: dest4, name: "Calatagan Archaeological Site", municipality: "Calatagan", era: "14th century", category: "UNESCO", id: "calatagan-archaeological", rating: 4.9 },
  { img: dest2, name: "Balayan Heritage Houses", municipality: "Balayan", era: "1800s", category: "Colonial", id: "balayan-heritage-houses", rating: 4.5 },
  { img: dest3, name: "Fortune Island Ruins", municipality: "Nasugbu", era: "1980s", category: "Colonial", id: "fortune-island", rating: 4.3 },
];

const categories = [
  { icon: Church, label: "Churches", desc: "Discover Spanish-era architecture and sacred spaces.", count: 4, img: dest1, color: "from-blue-600/80 to-blue-800/80" },
  { icon: Landmark, label: "Historical Landmarks", desc: "Walk through centuries of colonial history.", count: 3, img: dest2, color: "from-amber-600/80 to-amber-800/80" },
  { icon: BookOpen, label: "Cultural Sites", desc: "Experience living traditions and local stories.", count: 2, img: dest3, color: "from-rose-600/80 to-rose-800/80" },
  { icon: TreePine, label: "Natural Attraction", desc: "Explore protected forests and geological wonders.", count: 1, img: dest4, color: "from-emerald-600/80 to-emerald-800/80" },
];

const testimonials = [
  { name: "Maria Santos", role: "Heritage Advocate", rating: 5, text: "Batangas Heritage brought me back to my grandmother's stories. Walking through Balayan felt like stepping into a living museum." },
  { name: "Jose Reyes", role: "Travel Blogger", rating: 5, text: "The curated trails saved us hours of planning. The Calatagan archaeological sites were jaw-dropping." },
  { name: "Elena Cruz", role: "History Teacher", rating: 5, text: "I bring my students here every semester. The depth of information is unmatched — it makes history come alive." },
];

const InteractiveMap = lazy(() =>
  import("@/components/InteractiveMap").then((m) => ({ default: m.InteractiveMap }))
);

function HomePage() {
  const { user } = useAuth();
  const trendingSites = Route.useLoaderData();
  const [authModal, setAuthModal] = useState<{ open: boolean; title: string; description: string }>({
    open: false, title: "", description: "",
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  const personalizedSites = featuredSites.slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <AuthPrompt
        open={authModal.open}
        onClose={() => setAuthModal({ open: false, title: "", description: "" })}
        title={authModal.title}
        description={authModal.description}
      />

      {/* HERO */}
      <section ref={heroRef} id="top" className="relative min-h-[100svh] w-full overflow-hidden pt-24 md:pt-20">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <img src={heroImg} alt="Heritage town at golden hour" className="h-[115%] w-full object-cover" width={1920} height={1280} />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/40 to-cream" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream/60 via-transparent to-transparent" />
        </motion.div>

        <motion.div style={{ y: heroTextY }} className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] max-w-7xl flex-col justify-center px-6 pb-40 md:px-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-ink/70">
              <span className="h-px w-8 bg-ink/60" />
              A Living Atlas · Est. Heritage Trails
            </div>
            {user && user.onboarded && (
              <p className="mb-4 text-sm text-ink-soft">
                Welcome back, <span className="font-medium text-ink">{user.name.split(" ")[0]}</span>!
              </p>
            )}
            <h1 className="text-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-ink">
              Walk through <em className="italic text-accent">history</em>,<br />
              one stone at a time.
            </h1>
            <p className="mt-8 max-w-xl text-base text-ink-soft md:text-lg">
              Discover cultural heritage destinations across Batangas 1st District. Curated routes,
              interactive maps, and stories carried by every facade, terrace, and shore.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/explore" className="group rounded-full bg-ink px-8 py-3 text-sm text-primary-foreground transition hover:bg-accent">
                Explore Heritage
              </Link>
              <Link to="/map" className="group rounded-full border border-ink/25 bg-cream/60 px-8 py-3 text-sm text-ink backdrop-blur-md transition hover:bg-ink hover:text-primary-foreground">
                View Map
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE / RIBBON */}
      <section className="border-y border-ink/10 bg-parchment/60 py-5 grain">
        <div className="flex items-center gap-12 overflow-hidden whitespace-nowrap text-xs uppercase tracking-[0.35em] text-ink-soft">
          <MarqueeRow />
        </div>
      </section>

      {/* FEATURED HERITAGE SITES */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-14 flex items-end justify-between gap-6">
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
          <Link to="/explore" className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex">
            View all sites <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {featuredSites.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
              <Link to="/heritage/$id" params={{ id: d.id }} className="group relative flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-parchment">
                  <img src={d.img} alt={d.name} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute left-3 top-3 rounded-full bg-cream/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">{d.category}</span>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-1 text-xs font-medium text-ink opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 backdrop-blur">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    {d.rating}
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-display text-xl leading-tight text-ink transition-colors group-hover:text-accent">{d.name}</h3>
                    <p className="text-sm text-ink-soft">{d.municipality}</p>
                  </div>
                  <span className="font-mono text-xs text-accent">{d.era}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOURISM HIGHLIGHTS — Editorial Layout */}
      <section className="border-y border-ink/10 bg-parchment/40 grain">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-14">
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Tourism Highlights
            </div>
            <h2 className="text-display text-5xl leading-[1] md:text-7xl">
              What's <em className="italic text-accent">happening</em> in the district.
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Festivals, heritage walks, and cultural events happening across the five municipalities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Hero Feature Card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="group relative row-span-2 min-h-[420px] overflow-hidden rounded-3xl">
              <img src={dest1} alt="Parada ng Lechon" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-8">
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur">
                  <Calendar size={10} /> Festival
                </span>
                <h3 className="text-display text-3xl text-cream md:text-4xl">Parada ng Lechon</h3>
                <p className="mt-2 max-w-sm text-sm text-cream/80">
                  Experience Batangas' biggest food festival — a vibrant celebration of community, culture, and cuisine.
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-cream/70">
                  <span>June 24, 2026</span>
                  <span className="h-1 w-1 rounded-full bg-cream/40" />
                  <span>Balayan</span>
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cream transition-colors group-hover:text-accent">
                    Learn more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Supporting Cards */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="group relative overflow-hidden rounded-3xl">
              <img src={dest2} alt="Heritage Walk" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-ink/30" />
              <div className="relative flex flex-col justify-end p-8">
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur">
                  <Megaphone size={10} /> Event
                </span>
                <h3 className="text-display text-2xl text-cream">Heritage Walk: Balayan</h3>
                <p className="mt-2 text-sm text-cream/80">Every Saturday · Balayan Town Plaza</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="group relative overflow-hidden rounded-3xl">
              <img src={dest4} alt="New Heritage Markers" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-ink/30" />
              <div className="relative flex flex-col justify-end p-8">
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur">
                  <Megaphone size={10} /> Announcement
                </span>
                <h3 className="text-display text-2xl text-cream">New Heritage Markers Unveiled</h3>
                <p className="mt-2 text-sm text-cream/80">July 15, 2026 · Calatagan</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES — Horizontal Scroll with Images */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-14">
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> Categories
          </div>
          <h2 className="text-display text-5xl leading-[1] md:text-7xl">
            Explore by <em className="italic text-accent">type.</em>
          </h2>
          <p className="mt-4 max-w-lg text-ink-soft">
            Find the heritage experience that matches your interests — from sacred spaces to wild landscapes.
          </p>
        </motion.div>

        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0 snap-x snap-mandatory">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="min-w-[260px] snap-start md:min-w-0">
                <Link to="/explore" className="group relative flex h-[320px] flex-col justify-end overflow-hidden rounded-3xl">
                  <img src={c.img} alt={c.label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading="lazy" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.color}`} />
                  <div className="absolute inset-0 bg-ink/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative p-6">
                    <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-cream/20 text-cream backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                      <Icon size={18} strokeWidth={1.4} />
                    </span>
                    <h3 className="text-display text-xl text-cream">{c.label}</h3>
                    <p className="mt-1 text-sm text-cream/80">{c.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-cream/70 transition-colors group-hover:text-cream">
                      <span>{c.count} destinations</span>
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* POPULAR RIGHT NOW */}
      <section className="border-y border-ink/10 bg-parchment/40 grain">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-14 flex items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-8 bg-accent" /> Popular This Week
              </div>
              <h2 className="text-display text-5xl leading-[1] md:text-7xl">
                Trending <em className="italic text-accent">destinations.</em>
              </h2>
              <p className="mt-4 max-w-md text-ink-soft">
                The sites travelers are exploring most right now.
              </p>
            </div>
            <Link to="/explore" className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex">
              View all <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {trendingSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-card/60 px-6 py-16 text-center">
              <TrendingUp size={24} strokeWidth={1.5} className="text-ink-soft/40" />
              <h3 className="text-sm font-medium text-ink">No trending sites yet</h3>
              <p className="max-w-xs text-xs text-ink-soft">
                Check back soon — this section fills in as travelers visit and review heritage sites.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {trendingSites.map((site, i) => (
                <motion.div key={site.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                  <Link to="/heritage/$id" params={{ id: site.id }} className="group flex items-center gap-5 rounded-2xl border border-ink/10 bg-card p-4 transition-all hover:shadow-lg hover:border-ink/20">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-parchment">
                      {site.imageUrl ? (
                        <img src={site.imageUrl} alt={site.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <Landmark size={22} strokeWidth={1.5} className="text-ink-soft/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {site.category && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{site.category}</span>
                        </div>
                      )}
                      <h3 className="mt-1 truncate text-sm font-medium text-ink group-hover:text-accent transition-colors">{site.name}</h3>
                      <p className="mt-0.5 text-xs text-ink-soft">{site.municipality}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
                        {site.rating != null && (
                          <>
                            <span className="flex items-center gap-1">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              {site.rating.toFixed(1)}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-ink/20" />
                          </>
                        )}
                        <span>{site.metricValue} {site.metricLabel}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE MAP PREVIEW */}
      <section id="map" className="relative overflow-hidden bg-ink text-primary-foreground">
        <div className="absolute inset-0 opacity-30">
          <img src={mapTexture} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" />
        </div>
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
                Heritage sites across Batangas 1st District — tap a pin to preview
                stories, routes, and details.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-cream/15 pt-8">
                <Stat n="10" label="Heritage sites" />
                <Stat n="5" label="Municipalities" />
                <Stat n="6" label="Curated routes" />
              </div>
              <Link to="/map" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm text-ink transition hover:bg-accent hover:text-primary-foreground">
                Open Full Map <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense
                fallback={
                  <div className="flex h-[500px] w-full items-center justify-center rounded-2xl border border-cream/10 bg-cream/5 backdrop-blur md:h-[600px]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream/20 border-t-accent" />
                      <span className="font-mono text-xs uppercase tracking-widest text-cream/50">Loading map...</span>
                    </div>
                  </div>
                }
              >
                <InteractiveMap />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RECOMMENDED DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-14 flex items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> {user?.onboarded ? "Recommended For You" : "Recommended Sites"}
            </div>
            <h2 className="text-display text-5xl leading-[1] md:text-7xl">
              {user?.onboarded
                ? <>Destinations that <em className="italic text-accent">fit</em> you.</>
                : <>Explore <em className="italic text-accent">popular</em> destinations.</>
              }
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              {user?.onboarded
                ? "Curated picks based on your interests, travel style, and accessibility needs."
                : "The most loved heritage sites across the five municipalities."
              }
            </p>
          </div>
          {!user?.onboarded && (
            <button
              onClick={() => setAuthModal({
                open: true,
                title: "Sign in for personalized picks",
                description: "Create a free account to get heritage recommendations tailored to your interests, travel style, and accessibility needs.",
              })}
              className="hidden text-sm text-ink-soft underline underline-offset-4 hover:text-ink md:inline"
            >
              Get personalized picks →
            </button>
          )}
          {user?.onboarded && (
            <Link to="/explore" className="group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex">
              Get personalized picks <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personalizedSites.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}>
              <Link to="/heritage/$id" params={{ id: d.id }} className="group flex flex-col rounded-2xl border border-ink/10 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-ink/20 hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={d.img} alt={d.name} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">{d.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-display text-lg leading-tight text-ink group-hover:text-accent transition-colors">{d.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{d.municipality}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-ink-soft">{d.rating} · {d.era}</span>
                    </div>
                    <ArrowRight size={14} className="text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-ink/10 bg-parchment/50 grain">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-14 text-center">
            <div className="mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> Testimonials
            </div>
            <h2 className="text-display text-5xl leading-[1] md:text-7xl">
              Travelers <em className="italic text-accent">love</em> this.
            </h2>
            <p className="mt-4 mx-auto max-w-md text-ink-soft">
              Stories from the road — real experiences from heritage explorers.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }} className="rounded-2xl border border-ink/10 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-ink/20">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className={j < t.rating ? "fill-amber-400 text-amber-400" : "text-ink/20"} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-4">
                  <div className="h-10 w-10 rounded-full bg-parchment" />
                  <div>
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-ink-soft">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-44">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="relative overflow-hidden rounded-3xl bg-ink px-8 py-20 text-center text-primary-foreground md:px-16 md:py-32">
          <div className="absolute inset-0 opacity-20">
            <img src={mapTexture} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-6 flex w-fit items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70">
              <span className="h-px w-8 bg-cream/60" /> Start Your Journey
            </div>
            <h2 className="mx-auto max-w-3xl text-display text-5xl leading-[1] md:text-7xl">
              Carry the <em className="italic">archive</em> in your pocket.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-cream/70">
              {user?.onboarded
                ? "Your personalized journey continues. Explore nearby heritage sites, save your favorites, and share your discoveries."
                : "Join thousands of travelers exploring the Philippines' cultural heritage with curated routes, smart recommendations, and interactive maps."
              }
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/explore" className="group rounded-full bg-cream px-8 py-3 text-sm font-medium text-ink transition hover:bg-accent hover:text-primary-foreground">
                Start Exploring
              </Link>
              {!user?.onboarded && (
                <Link to="/signup" className="rounded-full border border-cream/30 px-8 py-3 text-sm text-cream/90 transition hover:border-cream">Create free account</Link>
              )}
              {user?.onboarded && (
                <Link to="/map" className="group rounded-full border border-cream/30 px-8 py-3 text-sm text-cream/90 transition hover:border-cream">
                  Open GIS Map <ArrowRight size={14} className="ml-1 inline transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-display text-4xl text-cream md:text-5xl">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-cream/60">{label}</div>
    </div>
  );
}

function MarqueeRow() {
  const items = ["Balayan · 1575", "Calatagan · UNESCO", "Nasugbu · 1611", "Lian · 1855", "Tuy · 1875", "Batangas Heritage Trail", "District 1 · Living Culture"];
  return (
    <div className="flex animate-[marquee_40s_linear_infinite] gap-12 [--tw:_]">
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center gap-12">
          {t}
          <span className="h-1 w-1 rounded-full bg-accent" />
        </span>
      ))}
      <style>{`@keyframes marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }`}</style>
    </div>
  );
}
