import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { getResolvedMunicipalityId, getAllDashboardDataAction } from "@/features/mto-dashboard/actions/dashboard"
import GreetingHeader from "@/features/mto-dashboard/components/greeting-header"
import StatCardsRow from "@/features/mto-dashboard/components/stat-cards-row"
import InsightsStrip from "@/features/mto-dashboard/components/insights-strip"
import VisitsOverviewChart from "@/features/mto-dashboard/components/visits-overview-chart"
import TopAttractionsChart from "@/features/mto-dashboard/components/top-attractions-chart"
import VisitsByAttractionChart from "@/features/mto-dashboard/components/visits-by-attraction-chart"
import VisitorStatsSummary from "@/features/mto-dashboard/components/visitor-stats-summary"
import ScanDeviceChart from "@/features/mto-dashboard/components/scan-device-chart"
import CategoryProgress from "@/features/mto-dashboard/components/category-progress"
import RecentSitesTable from "@/features/mto-dashboard/components/recent-sites-table"
import RecentScansList from "@/features/mto-dashboard/components/recent-scans-list"
import QuickActionsRow from "@/features/mto-dashboard/components/quick-actions-row"

export default async function MTODashboardPage() {
  const municipalityId = await getResolvedMunicipalityId()

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <GreetingHeader />
        <StatCardsRow municipalityId={municipalityId} />
        <QuickActionsRow />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VisitsOverviewChart municipalityId={municipalityId} />
          </div>
          <div>
            <TopAttractionsChart municipalityId={municipalityId} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <VisitsByAttractionChart municipalityId={municipalityId} />
          </div>
          <div>
            <VisitorStatsSummary municipalityId={municipalityId} />
          </div>
          <div>
            <ScanDeviceChart municipalityId={municipalityId} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <CategoryProgress municipalityId={municipalityId} />
          </div>
          <div className="lg:col-span-2">
            <RecentSitesTable municipalityId={municipalityId} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <RecentScansList municipalityId={municipalityId} />
          </div>
          <div className="lg:col-span-2">
            <InsightsStrip municipalityId={municipalityId} />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}
