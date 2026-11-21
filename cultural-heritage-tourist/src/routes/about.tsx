import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Shield, Map, Compass, Heart, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const values = [
  { icon: Map, title: "Preserve Heritage", body: "We document and catalog cultural heritage sites across the Philippines to ensure they are remembered and protected for future generations." },
  { icon: Compass, title: "Empower Travelers", body: "Our interactive tools help tourists plan meaningful journeys through historically rich communities." },
  { icon: Heart, title: "Community-Driven", body: "Reviews, photos, and stories from local communities and travelers create a living archive of cultural memory." },
  { icon: Users, title: "Accessible Tourism", body: "We prioritize accessibility information so every traveler can experience the Philippines heritage, regardless of ability." },
];

const municipalities = [
  { name: "Balayan", desc: "One of the oldest towns in Batangas, home to the Basilica of St. Martin de Tours and a rich colonial heritage corridor." },
  { name: "Calatagan", desc: "Site of significant pre-colonial archaeological finds and a UNESCO World Heritage candidate." },
  { name: "Lian", desc: "A coastal town with a 19th-century coral stone church and Spanish-era watchtower ruins." },
  { name: "Nasugbu", desc: "Gateway to Fortune Island and home to the historic Our Lady of the Assumption Parish, founded in 1611." },
  { name: "Tuy", desc: "A highland municipality with volcanic stone churches and the protected Gulod National Park." },
];

function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <section className="bg-cream border-b border-ink/10 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> About Batangas Heritage
            </div>
            <h1 className="text-display text-5xl leading-[1] md:text-7xl">
              A living atlas of <em className="italic text-accent">Philippine heritage.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
              Batangas Heritage is a cultural heritage tourism platform dedicated to documenting,
              preserving, and promoting the Philippines rich historical and cultural landmarks.
              We focus on Batangas 1st District — five municipalities of living history.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> Our Mission
          </div>
          <h2 className="text-display text-4xl leading-[1] md:text-5xl">
            Every stone has a <em className="italic text-accent">story.</em>
          </h2>
          <p className="mt-6 text-ink-soft leading-relaxed">
            The Philippines is home to thousands of heritage sites — from centuries-old churches
            and colonial houses to archaeological treasures and natural attractions. Many of these
            sites lack digital documentation, making them invisible to modern travelers.
          </p>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Batangas Heritage bridges this gap by creating a comprehensive, community-driven atlas
            that makes heritage tourism accessible, personalized, and meaningful. Our GIS-powered
            platform helps travelers discover, plan, and experience heritage sites with context
            and care.
          </p>
        </motion.div>
      </section>

      <section className="border-y border-ink/10 bg-parchment/40 grain">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14">
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> What We Stand For
            </div>
            <h2 className="text-display text-4xl leading-[1] md:text-5xl">
              Built on <em className="italic text-accent">values.</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} className="flex flex-col">
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-ink/15 bg-cream text-accent">
                    <Icon size={20} strokeWidth={1.4} />
                  </span>
                  <h3 className="text-display text-xl text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14">
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-8 bg-accent" /> Our Focus Area
          </div>
          <h2 className="text-display text-4xl leading-[1] md:text-5xl">
            Batangas 1st <em className="italic text-accent">District.</em>
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            Five municipalities. Centuries of history. A living heritage trail waiting to be explored.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {municipalities.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} className="rounded-2xl border border-ink/10 bg-cream p-6">
              <h3 className="text-display text-xl text-ink">{m.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-parchment/40 grain">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="text-display text-4xl leading-[1] md:text-5xl">
              Start your <em className="italic text-accent">journey.</em>
            </h2>
            <p className="mt-4 max-w-md mx-auto text-ink-soft">
              Explore heritage sites across Batangas 1st District. Every visit supports local preservation efforts.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/explore" className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
                Explore Heritage Sites
              </Link>
              <Link to="/map" className="rounded-full border border-ink/25 px-8 py-3 text-sm text-ink transition-colors hover:border-ink">
                View Interactive Map
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
