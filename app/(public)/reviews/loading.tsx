export default function ReviewsLoading() {
  return (
    <div className="animate-pulse">
      <section className="border-b border-ink/10 bg-cream pt-0 md:pt-0">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="max-w-3xl">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="mt-6 h-14 w-full max-w-lg rounded bg-muted md:h-20" />
            <div className="mt-6 h-4 w-full max-w-xl rounded bg-muted" />
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-parchment/30">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <div className="grid grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mx-auto h-10 w-20 rounded bg-muted" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="mb-14 h-10 w-72 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-ink/10 bg-card p-6">
              <div className="mb-4 h-4 w-24 rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-muted" />
                <div className="h-3.5 w-full rounded bg-muted" />
                <div className="h-3.5 w-2/3 rounded bg-muted" />
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-1">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
