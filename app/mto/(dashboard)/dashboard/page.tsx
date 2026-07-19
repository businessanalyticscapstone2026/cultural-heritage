import { getResolvedMunicipalityId } from "@/features/mto-dashboard/actions/dashboard"
import GreetingHeader from "@/features/mto-dashboard/components/greeting-header"
import StatCardsRow from "@/features/mto-dashboard/components/stat-cards-row"
import QuickActionsRow from "@/features/mto-dashboard/components/quick-actions-row"
import VisitsOverviewChart from "@/features/mto-dashboard/components/visits-overview-chart"
import VisitsByAttractionChart from "@/features/mto-dashboard/components/visits-by-attraction-chart"
import RecentSitesTable from "@/features/mto-dashboard/components/recent-sites-table"
import VisitorStatsSummary from "@/features/mto-dashboard/components/visitor-stats-summary"
import RecentScansList from "@/features/mto-dashboard/components/recent-scans-list"

export default async function MTODashboardPage() {
  const municipalityId = await getResolvedMunicipalityId()

  return (
    <div className="space-y-6">
      <GreetingHeader />
      <StatCardsRow municipalityId={municipalityId} />
      <QuickActionsRow />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitsOverviewChart municipalityId={municipalityId} />
        </div>
        <div>
          <VisitsByAttractionChart municipalityId={municipalityId} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentSitesTable municipalityId={municipalityId} />
        </div>
        <div className="space-y-6">
          <VisitorStatsSummary municipalityId={municipalityId} />
          <RecentScansList municipalityId={municipalityId} />
        </div>
      </div>
    </div>
  )
}
