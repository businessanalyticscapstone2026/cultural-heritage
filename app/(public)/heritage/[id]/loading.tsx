export default function HeritageDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="relative h-[400px] w-full bg-muted lg:h-[500px]" />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-4 h-4 w-48 rounded bg-muted" />

        <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-6">
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-14 rounded-full bg-muted" />
            </div>

            <div className="flex gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-4 w-24 rounded bg-muted" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg bg-muted" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-48 rounded-xl border border-border bg-card p-5">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>

            <div className="h-64 rounded-xl border border-border bg-card p-5">
              <div className="h-5 w-28 rounded bg-muted" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-3 w-16 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
