import type { TourismTrendReportData } from "../../types"

interface TourismTrendReportProps {
  data: TourismTrendReportData
}

export default function TourismTrendReport({ data }: TourismTrendReportProps) {
  return (
    <div className="space-y-8">
      <div className="report-section grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Total Visitors" value={data.summary.totalVisitors.toLocaleString()} />
        <StatBox label="Sites Visited" value={data.summary.totalSitesVisited.toLocaleString()} />
        <StatBox label="Recommendations" value={data.summary.totalRecommendations.toLocaleString()} />
        <StatBox label="Avg. Rating" value={data.summary.avgRating.toFixed(1)} />
      </div>

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Visitor Trend</h2>
        {data.visitorTrend.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No visitor data for the selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Period</th>
                  <th className="pb-2 pr-4 font-medium text-right">Visitors</th>
                  <th className="pb-2 font-medium">Bar</th>
                </tr>
              </thead>
              <tbody>
                {data.visitorTrend.map((point) => {
                  const maxVisitors = Math.max(...data.visitorTrend.map((p) => p.visitors), 1)
                  const barWidth = (point.visitors / maxVisitors) * 100
                  return (
                    <tr key={point.period} className="border-b last:border-0">
                      <td className="py-2 pr-4">{point.period}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{point.visitors.toLocaleString()}</td>
                      <td className="py-2">
                        <div className="h-4 rounded bg-[#2E5BFF]/10">
                          <div
                            className="h-4 rounded bg-[#2E5BFF]"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Visits by Attraction</h2>
        {data.visitsByAttraction.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No attraction data.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium text-right">Visits</th>
                <th className="pb-2 font-medium text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.visitsByAttraction.map((a) => (
                <tr key={a.categoryName} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{a.categoryName}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{a.visits.toLocaleString()}</td>
                  <td className="py-2 text-right tabular-nums">{a.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Visitor Demographics</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Visitor Type
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium text-right">Count</th>
                  <th className="pb-2 font-medium text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.demographics.visitorTypes.map((v) => (
                  <tr key={v.type} className="border-b last:border-0">
                    <td className="py-2 pr-4 capitalize">{v.type}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{v.count.toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">{v.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Age Group
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Age Group</th>
                  <th className="pb-2 pr-4 font-medium text-right">Count</th>
                  <th className="pb-2 font-medium text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.demographics.ageGroups.map((a) => (
                  <tr key={a.ageGroup} className="border-b last:border-0">
                    <td className="py-2 pr-4">{a.ageGroup}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{a.count.toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">{a.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
