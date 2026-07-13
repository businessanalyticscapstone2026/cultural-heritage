"use client"

import type { UnderPromotedSite } from "../types"
import { exportUnderPromotedSites } from "../services/export"
import { ExportButton } from "./export-button"

interface UnderPromotedSitesProps {
  data: UnderPromotedSite[]
}

export function UnderPromotedSitesSection({ data }: UnderPromotedSitesProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Under-promoted Heritage Sites</h2>
          <p className="text-xs text-muted-foreground">
            Sites with low recommendation counts and low visitor traffic
          </p>
        </div>
        <ExportButton
          label="Export CSV"
          onExport={() => exportUnderPromotedSites(data)}
        />
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No under-promoted sites found for the selected filters.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Site Name</th>
                <th className="pb-2 pr-4 font-medium">Municipality</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium text-right">Recommendations</th>
                <th className="pb-2 pr-4 font-medium text-right">Visits</th>
              </tr>
            </thead>
            <tbody>
              {data.map((site) => (
                <tr
                  key={site.siteId}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="py-2.5 pr-4 font-medium">{site.siteName}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {site.municipalityName}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {site.categoryName}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    <span
                      className={
                        site.recommendationCount === 0
                          ? "font-semibold text-destructive"
                          : ""
                      }
                    >
                      {site.recommendationCount}
                    </span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    <span
                      className={
                        site.visitCount === 0
                          ? "font-semibold text-destructive"
                          : ""
                      }
                    >
                      {site.visitCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
