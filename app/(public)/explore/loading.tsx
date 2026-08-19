export default function ExploreSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Page title (app/(public)/explore/page.tsx) */}
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 lg:px-10">
        <div className="h-9 w-64 rounded bg-muted" />
        <div className="mt-2 h-4 w-80 rounded bg-muted" />
      </div>

      {/* Hero (features/heritage/components/explore-client.tsx) */}
      <div className="bg-cream border-b border-ink/10">
        <div className="px-4 py-12 md:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 h-3 w-32 rounded bg-muted" />
            <div className="h-10 w-full max-w-md rounded bg-muted md:h-12" />
            <div className="mt-4 h-4 w-full max-w-lg rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-32 lg:px-10">
        {/* Search + filters row */}
        <div className="flex flex-col gap-4 py-8 border-b border-ink/10 md:flex-row md:items-center">
          <div className="h-9 flex-1 rounded-full bg-muted" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-36 rounded-full bg-muted" />
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-24 rounded-full bg-muted" />
            <div className="h-8 w-16 rounded-full bg-muted" />
            <div className="h-8 w-32 rounded-full bg-muted" />
          </div>
        </div>

        {/* Result count row */}
        <div className="flex items-center justify-between py-6">
          <div className="h-3 w-40 rounded bg-muted" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-ink/10 bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted" />
              <div className="flex flex-1 flex-col p-5">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-3 w-12 rounded bg-muted" />
                </div>
                <div className="mt-3 h-3 w-full rounded bg-muted" />
                <div className="mt-1.5 h-3 w-2/3 rounded bg-muted" />
                <div className="mt-auto pt-3 h-3 w-10 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
