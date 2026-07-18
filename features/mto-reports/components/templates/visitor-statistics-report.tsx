import type { VisitorStatisticsReportData } from "../../types"

interface VisitorStatisticsReportProps {
  data: VisitorStatisticsReportData
}

export default function VisitorStatisticsReport({ data }: VisitorStatisticsReportProps) {
  return (
    <div className="space-y-8">
      <div className="report-section grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Total Visitors" value={data.summary.totalVisitors.toLocaleString()} />
        <StatBox label="Local" value={data.summary.localCount.toLocaleString()} />
        <StatBox label="Domestic" value={data.summary.domesticCount.toLocaleString()} />
        <StatBox label="International" value={data.summary.internationalCount.toLocaleString()} />
      </div>

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Visitor Type Breakdown</h2>
        {data.visitorTypes.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No visitor data for the selected period.</p>
        ) : (
          <div className="space-y-2">
            {data.visitorTypes.map((v) => (
              <div key={v.type} className="flex items-center gap-3">
                <span className="w-24 text-xs capitalize text-gray-600">{v.type}</span>
                <div className="flex-1">
                  <div className="h-5 rounded bg-gray-100">
                    <div
                      className="h-5 rounded bg-[#2E5BFF]"
                      style={{ width: `${v.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-20 text-right text-xs tabular-nums">
                  {v.count.toLocaleString()} ({v.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Top Visited Sites</h2>
        {data.topSites.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No site visit data.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-3 font-medium">Site Name</th>
                <th className="pb-2 pr-3 font-medium">Category</th>
                <th className="pb-2 pr-3 font-medium text-right">Visits</th>
                <th className="pb-2 font-medium text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.topSites.map((site, index) => (
                <tr key={site.siteId} className="border-b last:border-0">
                  <td className="py-2 pr-3 tabular-nums text-gray-500">{index + 1}</td>
                  <td className="py-2 pr-3 font-medium">{site.siteName}</td>
                  <td className="py-2 pr-3 text-gray-600">{site.categoryName}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {site.visits.toLocaleString()}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {site.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0F2747]">{value}</p>
    </div>
  )
}
