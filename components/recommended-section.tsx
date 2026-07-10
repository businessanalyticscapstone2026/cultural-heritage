import Image from "next/image";
import { Bookmark, Star } from "lucide-react";

const sites = [
  {
    name: "San Juan Nepomuceno Parish",
    category: "Church",
    year: "1572",
    match: 95,
    src: "/images/municipalities/taal/Basilica Minore de San Martin de Tours - Taal Batangas.jfif",
  },
  {
    name: "Fort Duwero Ruins",
    category: "Fort",
    year: "1754",
    match: 91,
    src: "/images/municipalities/nasugbu/Transfiguration Chapel, Caleruega in Nasugbu, Batangas, Philippines_.jfif",
  },
  {
    name: "Taysay Lighthouse",
    category: "Lighthouse · Nasugbu",
    year: "1892",
    match: 92,
    src: "/images/municipalities/calatagan/Cape Santiago Lighthouse in Calatagan Batangas, _A Beacon of History with Over a Century Worth of Stories to Tell_.jfif",
  },
  {
    name: "Malvar Shrine Museum",
    category: "Museum",
    year: "1930",
    match: 90,
    src: "/images/municipalities/lian/Shrine & Parish of St_ John the Baptist in Lian, Batangas, Philippines.jfif",
  },
];

export default function RecommendedSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <h2 className="font-heading text-2xl font-semibold text-heading">
        Recommended for You
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {sites.map((site) => (
          <div
            key={site.name}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-md transition-shadow hover:shadow-xl"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={site.src}
                alt={site.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
              <button
                aria-label={`Bookmark ${site.name}`}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md text-primary"
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                {site.category}
              </p>
              <p className="mt-1 font-semibold text-heading">{site.year}</p>
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-xs font-medium text-secondary">
                  {site.match}% Match
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
