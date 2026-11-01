"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_REVIEW_TAGS, REVIEW_TAGS, type ReviewTagKey } from "../constants"

interface ReviewTagPillsProps {
  value: ReviewTagKey[]
  onChange: (tags: ReviewTagKey[]) => void
  error?: string
}

const GROUPS = [
  { sentiment: "positive", label: "What went well" },
  { sentiment: "negative", label: "What could be better" },
] as const

export function ReviewTagPills({ value, onChange, error }: ReviewTagPillsProps) {
  const selected = new Set(value)
  const limitReached = value.length >= MAX_REVIEW_TAGS

  const toggle = (key: ReviewTagKey) => {
    if (selected.has(key)) onChange(value.filter((k) => k !== key))
    else if (!limitReached) onChange([...value, key])
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-heading">
        Quick feedback <span className="font-normal text-muted-foreground">(optional, up to {MAX_REVIEW_TAGS})</span>
      </legend>
      {GROUPS.map((group) => (
        <div key={group.sentiment} className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.filter((t) => t.sentiment === group.sentiment).map((tag) => {
              const isOn = selected.has(tag.key)
              return (
                <button
                  key={tag.key}
                  type="button"
                  aria-pressed={isOn}
                  disabled={!isOn && limitReached}
                  onClick={() => toggle(tag.key)}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    isOn
                      ? group.sentiment === "positive"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-heading"
                  )}
                >
                  {isOn && <Check className="size-3" aria-hidden="true" />}
                  {tag.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </fieldset>
  )
}
