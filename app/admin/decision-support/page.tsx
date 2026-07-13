import { getReportData, getMunicipalityOptions, getCategoryOptions, getDefaultStartDate, getDefaultEndDate } from "@/features/reports/services"
import { ReportFilters } from "@/features/reports/components/report-filters"
import { UnderPromotedSitesSection } from "@/features/reports/components/under-promoted-sites"
import { MunicipalityPerformanceSection } from "@/features/reports/components/municipality-performance"
import { CategoryDemandSection } from "@/features/reports/components/category-demand"
import { ResourceAllocationSection } from "@/features/reports/components/resource-allocation"
import type { ReportFilters as ReportFiltersType } from "@/features/reports/types"

export default async function DecisionSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const startDate = (typeof params.startDate === "string" ? params.startDate : null) ?? getDefaultStartDate()
  const endDate = (typeof params.endDate === "string" ? params.endDate : null) ?? getDefaultEndDate()
  const municipalityId = typeof params.municipalityId === "string" ? params.municipalityId : undefined
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : undefined
  const threshold = parseInt(typeof params.threshold === "string" ? params.threshold : "10", 10) || 10

  const filters: ReportFiltersType = {
    startDate,
    endDate,
    municipalityId,
    categoryId,
  }

  const [data, municipalities, categories] = await Promise.all([
    getReportData(filters, threshold),
    getMunicipalityOptions(),
    getCategoryOptions(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Decision Support Reports</h1>
        <p className="text-sm text-muted-foreground">
          Tourism planning, policy formulation, promotional activities, and resource allocation
        </p>
      </div>

      <ReportFilters
        municipalities={municipalities}
        categories={categories}
        threshold={threshold}
      />

      <UnderPromotedSitesSection data={data.underPromotedSites} />
      <MunicipalityPerformanceSection data={data.municipalityPerformance} />
      <CategoryDemandSection data={data.categoryDemand} />
      <ResourceAllocationSection data={data.resourceAllocation} />
    </div>
  )
}
