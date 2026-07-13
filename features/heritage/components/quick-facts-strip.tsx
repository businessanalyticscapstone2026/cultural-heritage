import { Clock, MapPin, Tag, Ticket, Building } from "lucide-react"
import type { HeritageCategory } from "../types"

interface QuickFactsStripProps {
  category: HeritageCategory | null
  yearEstablished: string | null
  designation: string | null
  operatingHours: string | null
  entranceFee: string | null
}

interface Fact {
  icon: React.ReactNode
  label: string
  value: string
}

export default function QuickFactsStrip({
  category,
  yearEstablished,
  designation,
  operatingHours,
  entranceFee,
}: QuickFactsStripProps) {
  const facts: Fact[] = []

  if (category) {
    facts.push({
      icon: <Tag className="h-4 w-4" />,
      label: "Type",
      value: category.name,
    })
  }

  if (yearEstablished) {
    facts.push({
      icon: <Building className="h-4 w-4" />,
      label: "Established",
      value: yearEstablished,
    })
  }

  if (designation) {
    facts.push({
      icon: <MapPin className="h-4 w-4" />,
      label: "Designation",
      value: designation,
    })
  }

  if (operatingHours) {
    facts.push({
      icon: <Clock className="h-4 w-4" />,
      label: "Hours",
      value: operatingHours,
    })
  }

  if (entranceFee) {
    facts.push({
      icon: <Ticket className="h-4 w-4" />,
      label: "Entrance",
      value: entranceFee,
    })
  }

  if (facts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 rounded-xl border border-border bg-card px-5 py-4">
      {facts.map((fact) => (
        <div key={fact.label} className="flex items-center gap-2">
          <span className="text-muted-foreground">{fact.icon}</span>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {fact.label}
            </p>
            <p className="text-sm font-medium text-heading">{fact.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
