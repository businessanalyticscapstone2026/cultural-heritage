import Image from "next/image"
import Link from "next/link"
import { Bookmark } from "lucide-react"
import type { TopSite } from "@/features/home/types"

interface RecommendedSectionProps {
  sites: TopSite[]
}

export default function RecommendedSection({ sites }: RecommendedSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-2xl font-semibold text-heading">
          Popular Destinations
        </h2>
        <p className="text-xs text-muted">
          Sorted by visit count &middot;{" "}
          <span className="italic">Temporary until CHTS-024 recommendation engine ships</span>
        </p>
      </div>

      {sites.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No recommendations available yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/heritage/${site.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-md transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[4/3]">
                {site.imageUrl ? (
                  <Image
                    src={site.imageUrl}
                    alt={site.siteName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <button
                  type="button"
                  aria-label={`Bookmark ${site.siteName}`}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md text-primary"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                {site.categoryName && (
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {site.categoryName}
                  </p>
                )}
                {site.yearEstablished && (
                  <p className="mt-1 font-semibold text-heading">
                    {site.yearEstablished}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
