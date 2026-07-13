export default function NearbyLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>

      <div className="h-48 rounded-xl bg-muted lg:h-64" />

      <div className="flex gap-2">
        <div className="h-8 w-16 rounded-full bg-muted" />
        <div className="h-8 w-20 rounded-full bg-muted" />
        <div className="h-8 w-16 rounded-full bg-muted" />
        <div className="h-8 w-24 rounded-full bg-muted" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-3">
            <div className="h-16 w-16 shrink-0 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
