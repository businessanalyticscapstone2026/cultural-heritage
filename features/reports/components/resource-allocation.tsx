"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ResourceAllocation } from "../types"
import { exportResourceAllocation } from "../services/export"
import { ExportButton } from "./export-button"

interface ResourceAllocationSectionProps {
  data: ResourceAllocation[]
}

export function ResourceAllocationSection({ data }: ResourceAllocationSectionProps) {
  const chartData = data.map((r) => ({
    name: r.municipalityName,
    "Composite Score": r.compositeScore,
  }))

  const maxScore = Math.max(...data.map((r) => r.compositeScore), 0)

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Resource Allocation Input</h2>
          <p className="text-xs text-muted-foreground">
            Composite metric combining visitor volume and route usage per municipality
          </p>
        </div>
        <ExportButton
          label="Export CSV"
          onExport={() => exportResourceAllocation(data)}
        />
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No data for the selected filters.
        </p>
      ) : (
        <>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  className="text-muted-foreground"
                  domain={[0, Math.max(maxScore + 10, 100)]}
                />
                <Tooltip />
                <Bar dataKey="Composite Score" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Municipality</th>
                  <th className="pb-2 pr-4 font-medium text-right">Visitor Volume</th>
                  <th className="pb-2 pr-4 font-medium text-right">Routes</th>
                  <th className="pb-2 pr-4 font-medium text-right">Route Stops</th>
                  <th className="pb-2 pr-4 font-medium text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr
                    key={r.municipalityId}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-2.5 pr-4 font-medium">
                      {r.municipalityName}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {r.visitorVolume}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {r.routeCount}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {r.routeStopCount}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      <span
                        className={
                          r.compositeScore >= 50
                            ? "font-semibold text-orange-500"
                            : ""
                        }
                      >
                        {r.compositeScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
