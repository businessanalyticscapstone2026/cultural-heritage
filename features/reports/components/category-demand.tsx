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
import type { CategoryDemand } from "../types"
import { exportCategoryDemand } from "../services/export"
import { ExportButton } from "./export-button"

interface CategoryDemandSectionProps {
  data: CategoryDemand[]
}

export function CategoryDemandSection({ data }: CategoryDemandSectionProps) {
  const chartData = data.map((c) => ({
    name: c.categoryName,
    Recommendations: c.recommendationCount,
    Visits: c.visitCount,
  }))

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Category Demand</h2>
          <p className="text-xs text-muted-foreground">
            Which heritage categories tourists are most/least interested in
          </p>
        </div>
        <ExportButton
          label="Export CSV"
          onExport={() => exportCategoryDemand(data)}
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
                <Bar dataKey="Recommendations" fill="#f59e0b" />
                <Bar dataKey="Visits" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium text-right">Recommendations</th>
                  <th className="pb-2 pr-4 font-medium text-right">Visits</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    key={c.categoryId}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-2.5 pr-4 font-medium">{c.categoryName}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {c.recommendationCount}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {c.visitCount}
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
