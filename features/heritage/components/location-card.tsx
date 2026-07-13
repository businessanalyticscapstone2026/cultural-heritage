import { MapPin, ExternalLink } from "lucide-react"

interface LocationCardProps {
  siteId: string
  barangay: string | null
  municipalityName: string | null
  exactAddress: string | null
  latitude: number | null
  longitude: number | null
}

export default function LocationCard({
  siteId,
  barangay,
  municipalityName,
  exactAddress,
  latitude,
  longitude,
}: LocationCardProps) {
  const parts = [exactAddress, barangay, municipalityName].filter(Boolean)
  const fullAddress = parts.join(", ")

  const mapsUrl =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : `/map?site=${siteId}`

  return (
    <section
      aria-labelledby="location-heading"
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <h2
          id="location-heading"
          className="font-heading text-lg font-semibold text-heading"
        >
          Location
        </h2>
      </div>

      {fullAddress && (
        <p className="mt-3 text-sm leading-relaxed text-body">{fullAddress}</p>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Get Directions
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </section>
  )
}
