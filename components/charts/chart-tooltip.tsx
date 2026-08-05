import type { ReactNode } from "react"

export interface ChartTooltipRow {
  name: string
  value: ReactNode
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name?: string | number
    value?: number | string
    color?: string
    dataKey?: string | number
  }>
  label?: string | number
  labelFormatter?: (label: string | number | undefined) => ReactNode
  valueFormatter?: (value: number) => ReactNode
  hideLabel?: boolean
}

/**
 * Shared tooltip content for Recharts. Pass it as `content={<ChartTooltip />}`
 * so every chart shares the same styling and formatting.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  hideLabel = false,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const rows: ChartTooltipRow[] = payload.map((entry) => {
    const name =
      typeof entry.name === "string" && entry.name.length > 0
        ? entry.name
        : String(entry.dataKey ?? "")
    const value =
      typeof entry.value === "number" && valueFormatter
        ? valueFormatter(entry.value)
        : Number(entry.value ?? 0).toLocaleString()
    return {
      name,
      value,
      color: typeof entry.color === "string" ? entry.color : undefined,
    }
  })

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {!hideLabel && label != null && label !== "" && (
        <p className="mb-1.5 font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-2">
            {row.color && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span className="text-muted-foreground">{row.name}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
