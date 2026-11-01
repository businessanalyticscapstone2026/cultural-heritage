import { REVIEW_CRITERIA, REVIEW_TAGS } from "../constants"
import type { ReviewCriterionScore } from "@/types/review"
import { cn } from "@/lib/utils"

interface ReviewCriteriaBreakdownProps {
  criteria: ReviewCriterionScore[]
  tags: string[]
}

/** Per-criterion scores and quick-feedback tags shown on a review card. */
export function ReviewCriteriaBreakdown({ criteria, tags }: ReviewCriteriaBreakdownProps) {
  const scores = new Map(criteria.map((c) => [c.key, c.score]))
  const rows = REVIEW_CRITERIA.filter((c) => scores.has(c.key))
  const tagDefs = REVIEW_TAGS.filter((t) => tags.includes(t.key))

  if (rows.length === 0 && tagDefs.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      {rows.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
          {rows.map((c) => {
            const score = scores.get(c.key) ?? 0
            return (
              <div key={c.key} className="flex items-center gap-2 text-xs">
                <dt className="w-32 shrink-0 truncate text-muted-foreground">{c.label}</dt>
                <dd className="flex flex-1 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <span
                      className={cn(
                        "block h-full rounded-full bg-warning",
                        ["w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"][score - 1]
                      )}
                    />
                  </span>
                  <span className="w-8 text-right tabular-nums text-heading">
                    {score}/5
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>
      )}
      {tagDefs.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Quick feedback">
          {tagDefs.map((t) => (
            <li
              key={t.key}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                t.sentiment === "positive"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              )}
            >
              {t.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
