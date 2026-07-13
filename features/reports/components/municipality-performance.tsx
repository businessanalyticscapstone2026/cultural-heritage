"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { MunicipalityPerformance } from "../types"
import { exportMunicipalityPerformance } from "../services/export"
import { ExportButton } from "./export-button"

interface MunicipalityPerformanceSectionProps {
  data: MunicipalityPerformance[]
}

export function MunicipalityPerformanceSection({ data }: MunicipalityPerformanceSectionProps) {
  const chartData = data.map((m) => ({
    name: m.municipalityName,
    Local: m.localCount,
    Domestic: m.domesticCount,
    International: m.internationalCount,
  }))

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Municipality Performance</h2>
          <p className="text-xs text-muted-foreground">
            Visitor counts and type breakdown per municipality
          </p>
        </div>
        <ExportButton
          label="Export CSV"
          onExport={() => exportMunicipalityPerformance(data)}
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
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Local" fill="#22c55e" stackId="a" />
                <Bar dataKey="Domestic" fill="#3b82f6" stackId="a" />
                <Bar dataKey="International" fill="#a855f7" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Municipality</th>
                  <th className="pb-2 pr-4 font-medium text-right">Total</th>
                  <th className="pb-2 pr-4 font-medium text-right">Local</th>
                  <th className="pb-2 pr-4 font-medium text-right">Domestic</th>
                  <th className="pb-2 pr-4 font-medium text-right">International</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr
                    key={m.municipalityId}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-2.5 pr-4 font-medium">
                      {m.municipalityName}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums font-medium">
                      {m.totalVisitors}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {m.localCount}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {m.domesticCount}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {m.internationalCount}
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
