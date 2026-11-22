"use client"

import { useRef, type KeyboardEvent } from "react"
import { Route, Clock, Scale, Star, MapPin, List, Save, LogIn, CheckCircle2, type LucideIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ROUTE_OPTION_META } from "../constants"
import type { RouteOption, RouteOptionKind, RouteOptionsResult } from "../types"

const OPTION_ICONS: Record<RouteOptionKind, LucideIcon> = {
  shortest: Route,
  fastest: Clock,
  balanced: Scale,
  highlights: Star,
  "one-town": MapPin,
  "my-order": List,
}

interface RouteOptionsListProps {
  result: RouteOptionsResult
  selected: RouteOption | null
  onSelect: (kind: RouteOptionKind) => void
  compareAll: boolean
  onCompareAllChange: (compare: boolean) => void
  canSave: boolean
  onSave: () => void
  saving: boolean
  saveError: string | null
  savedId: string | null
}

function signed(value: number, unit: string): string {
  if (value === 0) return `0 ${unit}`
  return `${value > 0 ? "+" : "−"}${Math.abs(value)} ${unit}`
}

export function RouteOptionsSkeleton() {
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

export default function RouteOptionsList({
  result,
  selected,
  onSelect,
  compareAll,
  onCompareAllChange,
  canSave,
  onSave,
  saving,
  saveError,
  savedId,
}: RouteOptionsListProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { options, recommendedKind } = result

  // Radio group keyboard pattern: arrow keys move the selection and the focus.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      onSelect(options[index].kind)
      return
    }
    if (step === 0) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onSelect(options[next].kind)
    cardRefs.current[next]?.focus()
  }

  const announcement =
    options.length === 1 ? "All strategies agree on one best order." : `${options.length} route options found.`

  return (
    <div className="space-y-2">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="flex items-center justify-between">
        <h3 id="route-options-heading" className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          Options
        </h3>
        {options.length > 1 && (
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-soft">
            <Switch size="sm" checked={compareAll} onCheckedChange={(checked) => onCompareAllChange(checked)} />
            Compare all on map
          </label>
        )}
      </div>

      {options.length === 1 && <p className="text-[11px] text-ink-soft">All strategies agree on one best order.</p>}

      <div role="radiogroup" aria-labelledby="route-options-heading" className="space-y-1.5">
        {options.map((option, index) => {
          const isSelected = selected?.kind === option.kind
          const meta = ROUTE_OPTION_META[option.kind]
          const Icon = OPTION_ICONS[option.kind]
          const label = option.labels.map((k) => ROUTE_OPTION_META[k].label).join(" + ")
          const isShortest = option.labels.includes("shortest")
          return (
            <div
              key={option.kind}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${label}: ${option.totalDistanceKm} kilometres, ${option.totalDurationMin} minutes`}
              tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
              onClick={() => onSelect(option.kind)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex cursor-pointer gap-2 rounded-lg border bg-card p-2 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-accent/50",
                isSelected ? "border-ink/40 ring-1 ring-ink/20" : "border-ink/10 hover:border-ink/25",
              )}
            >
              <span className={cn("w-1.5 shrink-0 self-stretch rounded-full", meta.barClass)} aria-hidden="true" />
              <span
                className={cn(
                  "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full border",
                  isSelected ? "border-ink" : "border-ink/30",
                )}
                aria-hidden="true"
              >
                {isSelected && <span className="size-1.5 rounded-full bg-ink" />}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-1">
                  <span className="flex min-w-0 items-start gap-1 text-xs font-semibold leading-tight text-ink">
                    <Icon className="mt-px size-3 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </span>
                  {option.labels.includes(recommendedKind) && (
                    <span className="shrink-0 rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-medium text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink">
                  <span className="font-medium">
                    {option.totalDistanceKm} km · {option.totalDurationMin} min
                  </span>
                  {!isShortest && (
                    <span className="rounded bg-parchment px-1 font-mono text-[10px] text-ink-soft">
                      {signed(option.deltaVsShortest.km, "km")} · {signed(option.deltaVsShortest.min, "min")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-ink-soft">
                  <span>
                    {option.townChanges} town change{option.townChanges === 1 ? "" : "s"}
                  </span>
                  {option.exceedsTimeLimit && (
                    <span className="rounded border border-error/40 px-1 font-medium text-red-700">Over time limit</span>
                  )}
                  {option.estimated && <span className="rounded border border-ink/20 px-1">Estimated</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selected && <p className="text-[10px] text-ink-soft">{ROUTE_OPTION_META[selected.kind].description}.</p>}

      {canSave ? (
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !selected || savedId !== null}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-card py-2 text-xs font-medium text-ink transition-colors hover:bg-parchment/60 focus-visible:ring-3 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savedId ? <CheckCircle2 className="size-3.5 text-green-700" /> : <Save className="size-3.5" />}
          {savedId ? "Route saved" : saving ? "Saving..." : "Save this route"}
        </button>
      ) : (
        <p className="flex items-center gap-1 text-[10px] text-ink-soft">
          <LogIn className="size-3" />
          <span>Log in to save this route.</span>
        </p>
      )}
      {saveError && (
        <p className="text-[11px] text-red-700" role="alert">
          {saveError}
        </p>
      )}
    </div>
  )
}
