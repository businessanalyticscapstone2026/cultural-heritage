import Link from "next/link";
import Image from "next/image";

const municipalities = [
  {
    name: "Nasugbu",
    src: "/images/municipalities/nasugbu/c1f5e5219acf2346c55cd2b389e7b34e.jpg",
  },
  {
    name: "Taal",
    src: "/images/municipalities/taal/Heritage Town of Taal.jfif",
  },
  {
    name: "Balayan",
    src: "/images/municipalities/balayan/Immaculate Conception Parish in Balayan, Batangas, Philippines.jfif",
  },
];

export default function FeaturedMunicipalities() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <h2 className="font-heading text-2xl font-semibold text-heading">
        Featured Municipalities
      </h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {municipalities.map((m) => (
          <Link
            key={m.name}
            href={`/municipality/${m.name.toLowerCase()}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-xl"
          >
            <Image
              src={m.src}
              alt={`${m.name} heritage destination`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(15,39,71,0.8), rgba(15,39,71,0.1), transparent)",
              }}
            />
            <div className="absolute bottom-5 left-5 right-5">
              <h3 className="font-heading text-xl font-semibold text-white">
                {m.name}
              </h3>
              <span className="mt-1 inline-block text-sm text-white/85">
                Explore &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
