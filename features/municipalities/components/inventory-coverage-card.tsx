import { AlertTriangle, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InventoryCoverage } from "../services/inventory-coverage"

interface InventoryCoverageCardProps {
  coverage: InventoryCoverage | null
  /** Smaller type for sidebars (tourist map statistics). */
  compact?: boolean
  className?: string
}

function ProgressBar({ percent, label }: { percent: number | null; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? undefined}
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${percent ?? 0}%` }} />
    </div>
  )
}

/** Encoded vs documented heritage inventory (paper Table 4.1), overall and per municipality. */
export default function InventoryCoverageCard({ coverage, compact, className }: InventoryCoverageCardProps) {
  if (!coverage) {
    return (
      <p role="status" className={cn("text-xs text-muted-foreground", className)}>
        Inventory coverage is unavailable right now. Reload the page to try again.
      </p>
    )
  }

  const { totalEncoded, totalDocumented, percent } = coverage

  return (
    <section className={cn("space-y-3", className)} aria-label="Heritage inventory coverage">
      <div className="space-y-1.5">
        <p className={cn("flex items-center gap-1.5 font-medium", compact ? "text-xs" : "text-sm")}>
          <ClipboardList className="size-4 text-primary" aria-hidden="true" />
          {totalDocumented > 0
            ? `Encoded ${totalEncoded} of ${totalDocumented} documented${percent != null ? ` (${percent}%)` : ""}`
            : `Encoded ${totalEncoded} (documented count not set)`}
        </p>
        <ProgressBar percent={percent} label="Overall inventory coverage" />
      </div>

      <ul className="space-y-2">
        {coverage.rows.map((row) => (
          <li key={row.municipalityId} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">{row.name}</span>
              <span className="flex shrink-0 items-center gap-1.5 font-mono text-muted-foreground">
                {row.needsReview && (
                  <span
                    className="flex items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0.5 font-sans text-[10px] font-medium text-warning"
                    title="More sites are encoded than documented"
                  >
                    <AlertTriangle className="size-2.5" aria-hidden="true" />
                    documented count needs review
                  </span>
                )}
                {row.encoded} / {row.documented ?? "?"}
              </span>
            </div>
            <ProgressBar percent={row.percent} label={`${row.name} inventory coverage`} />
          </li>
        ))}
      </ul>
    </section>
  )
}
