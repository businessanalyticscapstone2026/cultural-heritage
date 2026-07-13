import GreetingHeader from "@/features/mto-dashboard/components/greeting-header"
import StatCardsRow from "@/features/mto-dashboard/components/stat-cards-row"
import QuickActionsRow from "@/features/mto-dashboard/components/quick-actions-row"
import VisitsOverviewChart from "@/features/mto-dashboard/components/visits-overview-chart"
import VisitsByAttractionChart from "@/features/mto-dashboard/components/visits-by-attraction-chart"
import RecentSitesTable from "@/features/mto-dashboard/components/recent-sites-table"
import VisitorStatsSummary from "@/features/mto-dashboard/components/visitor-stats-summary"
import RecentScansList from "@/features/mto-dashboard/components/recent-scans-list"

export default function MTODashboardPage() {
  return (
    <div className="space-y-6">
      <GreetingHeader />
      <StatCardsRow />
      <QuickActionsRow />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitsOverviewChart />
        </div>
        <div>
          <VisitsByAttractionChart />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentSitesTable />
        </div>
        <div className="space-y-6">
          <VisitorStatsSummary />
          <RecentScansList />
        </div>
      </div>
    </div>
  )
}
