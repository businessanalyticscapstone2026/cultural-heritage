import { Calendar } from "lucide-react"

export default function AnnouncementsSection() {
  return (
    <section className="bg-card py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2 className="font-heading text-2xl font-semibold text-heading">
          Upcoming Events &amp; Announcements
        </h2>

        <div className="mt-6 rounded-xl border border-dashed border-muted bg-warm-white p-10 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm text-muted">
            Events and announcements coming soon.
          </p>
          <p className="mt-1 text-xs text-muted">
            TODO: Requires an `announcements` table migration (see
            supabase/migrations/XXXXX_add_announcements.sql).
          </p>
        </div>
      </div>
    </section>
  )
}
