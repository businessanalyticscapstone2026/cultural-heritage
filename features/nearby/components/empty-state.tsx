import { MapPinOff, Maximize } from "lucide-react"
import { EmptyState as SharedEmptyState } from "@/components/shared/empty-state"

interface EmptyStateProps {
  radius: number
  onExpandRadius: () => void
}

export default function EmptyState({ radius, onExpandRadius }: EmptyStateProps) {
  return (
    <SharedEmptyState
      icon={<MapPinOff size={24} strokeWidth={1.5} className="text-ink-soft/40" />}
      title="No heritage sites found"
      description={`There are no heritage sites within ${radius} km of your current location. Try expanding your search radius or browse all heritage sites.`}
      actions={[
        { label: "Expand search", onClick: onExpandRadius, icon: <Maximize size={14} /> },
        { label: "Browse all sites", href: "/explore", variant: "outline" },
      ]}
    />
  )
}