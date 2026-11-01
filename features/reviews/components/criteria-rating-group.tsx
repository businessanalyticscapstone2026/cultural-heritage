"use client"

import { StarRating } from "./star-rating"
import { StarDisplay } from "./star-display"
import { REVIEW_CRITERIA, type ReviewCriterionKey } from "../constants"
import { averageCriteriaScore, deriveOverallRating } from "../utils/review-criteria"

interface CriteriaRatingGroupProps {
  value: Record<ReviewCriterionKey, number>
  onChange: (key: ReviewCriterionKey, score: number) => void
  errors?: Partial<Record<ReviewCriterionKey, string>>
}

export function CriteriaRatingGroup({ value, onChange, errors }: CriteriaRatingGroupProps) {
  const scores = REVIEW_CRITERIA.map((c) => value[c.key] ?? 0)
  const ratedCount = scores.filter((s) => s > 0).length
  const overall = deriveOverallRating(scores)
  const average = averageCriteriaScore(scores)

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-heading">Rate your visit</legend>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {REVIEW_CRITERIA.map((criterion) => {
          const errorId = `criterion-${criterion.key}-error`
          const error = errors?.[criterion.key]
          return (
            <li
              key={criterion.key}
              className="flex flex-col gap-1.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm text-heading">{criterion.label}</p>
                <p className="text-xs text-muted-foreground">{criterion.description}</p>
                {error && (
                  <p id={errorId} className="mt-0.5 text-xs text-destructive">
                    {error}
                  </p>
                )}
              </div>
              <StarRating
                value={value[criterion.key] ?? 0}
                onChange={(score) => onChange(criterion.key, score)}
                label={`${criterion.label} rating`}
                describedBy={error ? errorId : undefined}
                size="md"
              />
            </li>
          )
        })}
      </ul>
      <div
        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
        aria-live="polite"
      >
        <span className="text-sm font-medium text-heading">Overall</span>
        {ratedCount > 0 ? (
          <span className="flex items-center gap-2">
            <StarDisplay rating={average} size="md" />
            <span className="text-sm font-semibold text-heading">{overall}/5</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Rate each criterion above</span>
        )}
      </div>
    </fieldset>
  )
}
