import Link from "next/link"
import { MapPin } from "lucide-react"

export default function HeritageNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MapPin className="h-8 w-8 text-muted-foreground" />
      </div>

      <h2 className="mt-6 font-heading text-2xl font-semibold text-heading">
        Heritage site not found
      </h2>

      <p className="mt-2 max-w-md text-body">
        The heritage site you&apos;re looking for doesn&apos;t exist or is no
        longer available.
      </p>

      <Link
        href="/explore"
        className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Explore Heritage Sites
      </Link>
    </div>
  )
}
