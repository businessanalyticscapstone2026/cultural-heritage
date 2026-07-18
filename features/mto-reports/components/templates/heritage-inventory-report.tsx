import type { HeritageInventoryReportData } from "../../types"

interface HeritageInventoryReportProps {
  data: HeritageInventoryReportData
}

export default function HeritageInventoryReport({ data }: HeritageInventoryReportProps) {
  return (
    <div className="space-y-8">
      <div className="report-section grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Total Sites" value={data.summary.totalSites.toLocaleString()} />
        <StatBox label="Published" value={data.summary.publishedCount.toLocaleString()} />
        <StatBox label="Draft" value={data.summary.draftCount.toLocaleString()} />
        <StatBox
          label="Categories"
          value={data.summary.categoryBreakdown.length.toLocaleString()}
        />
      </div>

      {data.summary.categoryBreakdown.length > 0 && (
        <div className="report-section">
          <h2 className="mb-3 text-base font-bold text-[#0F2747]">Category Breakdown</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 font-medium text-right">Sites</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.categoryBreakdown.map((cat) => (
                <tr key={cat.categoryName} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{cat.categoryName}</td>
                  <td className="py-2 text-right tabular-nums">{cat.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="report-section">
        <h2 className="mb-3 text-base font-bold text-[#0F2747]">Heritage Sites</h2>
        {data.sites.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            No heritage sites found for this municipality.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-3 font-medium">#</th>
                  <th className="pb-2 pr-3 font-medium">Site Name</th>
                  <th className="pb-2 pr-3 font-medium">Category</th>
                  <th className="pb-2 pr-3 font-medium">Barangay</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium">Coordinates</th>
                  <th className="pb-2 font-medium">Date Added</th>
                </tr>
              </thead>
              <tbody>
                {data.sites.map((site, index) => (
                  <tr key={site.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-3 tabular-nums text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-1.5 pr-3 font-medium">{site.siteName}</td>
                    <td className="py-1.5 pr-3 text-gray-600">
                      {site.categoryName ?? "—"}
                    </td>
                    <td className="py-1.5 pr-3 text-gray-600">
                      {site.barangay ?? "—"}
                    </td>
                    <td className="py-1.5 pr-3">
                      <span
                        className={
                          site.publicationStatus === "published"
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {site.publicationStatus}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums text-gray-500">
                      {site.latitude != null && site.longitude != null
                        ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`
                        : "—"}
                    </td>
                    <td className="py-1.5 text-gray-500">
                      {new Date(site.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
