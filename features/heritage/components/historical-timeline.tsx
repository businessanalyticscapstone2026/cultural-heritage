import { Clock } from "lucide-react"

interface HistoricalTimelineProps {
  historicalPeriod: string | null
  yearEstablished: string | null
  historicalSignificance: string | null
}

export default function HistoricalTimeline({
  historicalPeriod,
  yearEstablished,
  historicalSignificance,
}: HistoricalTimelineProps) {
  const milestones: { year: string; label: string }[] = []

  if (yearEstablished) {
    milestones.push({ year: yearEstablished, label: "Established" })
  }

  if (historicalPeriod) {
    milestones.push({ year: historicalPeriod, label: "Historical Period" })
  }

  if (milestones.length === 0) return null

  return (
    <section aria-labelledby="timeline-heading">
      <h2
        id="timeline-heading"
        className="font-heading text-lg font-semibold text-heading"
      >
        Historical Timeline
      </h2>

      <div className="relative mt-4 ml-3 border-l-2 border-dashed border-border pl-6">
        {milestones.map((milestone, i) => (
          <div key={i} className="relative mb-6 last:mb-0">
            <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-secondary bg-card">
              <Clock className="h-2.5 w-2.5 text-secondary" />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-secondary">
              {milestone.year}
            </p>
            <p className="mt-0.5 text-sm text-body">{milestone.label}</p>
          </div>
        ))}

        {historicalSignificance && (
          <div className="relative mb-6 last:mb-0">
            <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-card">
              <Clock className="h-2.5 w-2.5 text-primary" />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Significance
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-body">
              {historicalSignificance}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
