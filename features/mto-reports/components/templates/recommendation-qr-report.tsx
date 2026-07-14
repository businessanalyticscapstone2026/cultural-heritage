import type { RecommendationQRReportData } from "../../types"

interface RecommendationQRReportProps {
  data: RecommendationQRReportData
}

export default function RecommendationQRReport({ data }: RecommendationQRReportProps) {
  const funnelMax = Math.max(data.funnel.generated, 1)

  return (
    <div className="space-y-8">
      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Recommendation Funnel</h2>
        <div className="space-y-3">
          <FunnelRow label="Generated" value={data.funnel.generated} max={funnelMax} />
          <FunnelRow label="Clicked" value={data.funnel.clicked} max={funnelMax} />
          <FunnelRow label="Route Plans" value={data.funnel.routePlans} max={funnelMax} />
          <FunnelRow label="Conversions" value={data.funnel.conversions} max={funnelMax} />
        </div>

        {data.funnel.generated > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Click Rate: </span>
              <span className="font-medium tabular-nums">
                {((data.funnel.clicked / data.funnel.generated) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Conversion Rate: </span>
              <span className="font-medium tabular-nums">
                {((data.funnel.conversions / data.funnel.generated) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">QR Scan Activity</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Total Scans" value={data.qrSummary.totalScans.toLocaleString()} />
          <StatBox label="Unique Sites" value={data.qrSummary.uniqueSites.toLocaleString()} />
          <StatBox label="Avg. Scans/Day" value={data.qrSummary.avgScansPerDay.toLocaleString()} />
        </div>
      </div>

      {data.sitePerformance.length > 0 && (
        <div className="report-section">
          <h2 className="mb-3 text-base font-bold text-[#0F2747]">Site Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-3 font-medium">Site Name</th>
                  <th className="pb-2 pr-3 font-medium text-right">Recommended</th>
                  <th className="pb-2 pr-3 font-medium text-right">Clicked</th>
                  <th className="pb-2 pr-3 font-medium text-right">Converted</th>
                  <th className="pb-2 pr-3 font-medium text-right">Click Rate</th>
                  <th className="pb-2 font-medium text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.sitePerformance.map((site) => (
                  <tr key={site.siteId} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{site.siteName}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{site.timesRecommended}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{site.timesClicked}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{site.timesConverted}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {site.clickRate.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {site.convRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const barWidth = (value / max) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-gray-600">{label}</span>
      <div className="flex-1">
        <div className="h-5 rounded bg-gray-100">
          <div
            className="h-5 rounded bg-[#2E5BFF]"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      <span className="w-16 text-right text-xs font-medium tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0F2747]">{value}</p>
    </div>
  )
}
