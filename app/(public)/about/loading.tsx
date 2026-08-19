export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-6 pb-20 pt-10 md:px-10">
      <div className="mb-12">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="mt-6 h-12 w-full max-w-xl rounded bg-muted md:h-16" />
        <div className="mt-6 h-4 w-full max-w-xl rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
      </div>

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink/10 bg-cream p-6 md:p-8">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-3.5 w-full rounded bg-muted" />
              <div className="h-3.5 w-full rounded bg-muted" />
              <div className="h-3.5 w-2/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
