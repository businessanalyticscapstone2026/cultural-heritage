export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <section className="flex min-h-[100svh] w-full flex-col justify-end bg-parchment/40 px-6 pb-16 pt-24 md:px-10 md:pt-32">
        <div className="mx-auto w-full max-w-7xl">
          <div className="h-3 w-72 rounded bg-muted" />
          <div className="mt-6 h-20 w-full max-w-3xl rounded bg-muted md:h-28" />
          <div className="mt-4 h-20 w-full max-w-2xl rounded bg-muted md:h-16" />
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-48 rounded-full bg-muted" />
            <div className="h-12 w-40 rounded-full bg-muted" />
          </div>
        </div>
      </section>

      {/* Featured sites */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 h-10 w-80 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] rounded-2xl bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 h-10 w-72 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-3xl bg-muted" />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 h-10 w-96 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-5 rounded-2xl border border-ink/10 p-4">
              <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
