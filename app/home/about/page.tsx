import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Batangas Heritage",
  description: "Learn about the Cultural Heritage Decision Support System.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-20 md:px-10 md:pt-28">
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent">
          <span className="h-px w-8 bg-accent" /> About
        </div>
        <h1 className="text-display text-4xl leading-[1] md:text-6xl">
          A living atlas of <em className="italic text-accent">cultural heritage.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
          The Cultural Heritage Decision Support System (TCDSS) maps, preserves, and promotes
          the rich heritage of the First District of Batangas.
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink-soft leading-relaxed">
        <section className="rounded-2xl border border-ink/10 bg-cream p-6 md:p-8">
          <h2 className="text-display text-lg text-ink mb-3">Our Mission</h2>
          <p>
            To centralize cultural heritage information while providing decision support tools
            for tourism officers, planners, and travelers — making Batangas heritage accessible to all.
          </p>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-cream p-6 md:p-8">
          <h2 className="text-display text-lg text-ink mb-3">Key Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Heritage Information Management</li>
            <li>GIS Mapping and Visualization</li>
            <li>Personalized Recommendation System</li>
            <li>Route Optimization</li>
            <li>Tourism Analytics and Reports</li>
            <li>QR Code Integration</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-cream p-6 md:p-8">
          <h2 className="text-display text-lg text-ink mb-3">Primary Users</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provincial Tourism and Cultural Affairs Office (PTCAO)</li>
            <li>Municipal Tourism Offices (MTO)</li>
            <li>Tourists and Heritage Enthusiasts</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
