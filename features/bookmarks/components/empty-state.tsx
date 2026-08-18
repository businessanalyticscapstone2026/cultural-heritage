import { Bookmark, Compass, MapPin } from "lucide-react"
import { EmptyState as SharedEmptyState } from "@/components/shared/empty-state"

export function EmptyState() {
  return (
    <SharedEmptyState
      icon={<Bookmark size={24} strokeWidth={1.5} className="text-ink-soft/40" />}
      title="No saved sites yet"
      description="Bookmark heritage sites you&apos;re interested in and they&apos;ll appear here for easy access later."
      actions={[
        { label: "Explore Heritage Sites", href: "/explore", icon: <Compass size={14} /> },
        {
          label: "Nearby Attractions",
          href: "/nearby",
          icon: <MapPin size={14} />,
          variant: "outline",
        },
      ]}
    />
  )
}