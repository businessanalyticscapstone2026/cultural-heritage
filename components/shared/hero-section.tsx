import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import RestrictedLink from "@/components/auth/restricted-link"

interface HeroSectionProps {
  siteName?: string | null
  heroImage?: string | null
}

export default function HeroSection({
  siteName,
  heroImage,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden lg:min-h-[650px]">
      {heroImage ? (
        <Image
          src={heroImage}
          alt={siteName ?? "First District of Batangas Cultural Heritage"}
          fill
          priority
          loading="eager"
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-primary" />
      )}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="font-heading text-[2.5rem] font-semibold leading-[1.12] text-white sm:text-5xl lg:text-[3.25rem]">
            Discover the
            <br />
            First District of
            <br />
            Batangas
          </h1>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-heading text-2xl italic text-white/80">
              Cultural Heritage
            </p>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform hover:scale-105">
              <Play className="ml-0.5 h-5 w-5 fill-primary text-primary" />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/explore"
              className="rounded-lg bg-primary px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Explore Heritage
            </Link>
            <RestrictedLink
              href="/map"
              title="Sign in to view the map"
              description="Explore heritage sites across the First District of Batangas with our interactive GIS map."
              className="rounded-lg border-2 border-white/80 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-primary"
            >
              Interactive GIS Map
            </RestrictedLink>
          </div>
        </div>
      </div>
    </section>
  )
}
