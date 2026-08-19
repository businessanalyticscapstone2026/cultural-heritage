export default function MapLoading() {
  return (
    <div className="flex h-full gap-0 overflow-hidden">
      <aside className="hidden w-80 shrink-0 flex-col border-r border-ink/10 bg-cream lg:flex">
        <div className="border-b border-ink/10 px-4 py-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="border-b border-ink/10 p-3">
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex-1 space-y-3 overflow-hidden p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="h-full flex-1 animate-pulse bg-muted" />
    </div>
  )
}
