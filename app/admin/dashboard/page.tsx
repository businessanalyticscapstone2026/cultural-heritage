import Link from "next/link"
import {
  Landmark,
  Building2,
  Users,
  CalendarCheck,
  PlusCircle,
  UserCog,
  Map,
  FileText,
  Settings,
  Database,
  ArrowUpRight,
} from "lucide-react"
import { getDashboardData } from "@/features/dashboard/services"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { VisitsLineChart } from "@/components/dashboard/visits-line-chart"
import { HeritageMap } from "@/components/dashboard/heritage-map"

export default async function AdminDashboardPage() {
  const data = await getDashboardData()
  const totalCategoryCount = data.categoryBreakdown.reduce((acc, c) => acc + c.count, 0)
  const totalVisits = data.visitOverview.reduce((acc, v) => acc + v.count, 0)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Tourism Cultural Decision Support System</h1>
        <p className="mt-1 text-sm opacity-80">PTCAO Administrator Dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Landmark}
          label="Total Heritage Sites"
          value={data.kpis.totalHeritageSites}
        />
        <KpiCard
          icon={Building2}
          label="Municipalities"
          value={data.kpis.totalMunicipalities}
        />
        <KpiCard
          icon={Users}
          label="Registered Users"
          value={data.kpis.totalRegisteredUsers}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Visitors This Month"
          value={data.kpis.totalVisitsThisMonth}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <QuickActionButton icon={PlusCircle} label="Add Heritage Site" href="/admin/heritage-repository" />
          <QuickActionButton icon={UserCog} label="Manage Users" href="/admin/users" />
          <QuickActionButton icon={Map} label="GIS Map Editor" href="/admin/gis-admin" />
          <QuickActionButton icon={FileText} label="Generate Reports" href="/admin/decision-support" />
          <QuickActionButton icon={Settings} label="System Settings" href="/admin/settings" />
          <QuickActionButton icon={Database} label="Backup Now" href="/admin/settings" />
        </div>
      </div>

      {/* Three-column Widget Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heritage Sites by Category (Donut Chart) */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Heritage Sites by Category</h3>
          <DonutChart data={data.categoryBreakdown} total={totalCategoryCount} />
          <div className="mt-4 space-y-1.5">
            {data.categoryBreakdown
              .filter((c) => c.count > 0)
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                  <span className="font-medium tabular-nums">{c.count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recently Added Heritage Sites */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Recently Added</h3>
          {data.recentSites.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No heritage sites yet</p>
          ) : (
            <ul className="space-y-3">
              {data.recentSites.map((site) => (
                <li key={site.id} className="border-border border-b pb-3 last:border-0 last:pb-0">
                  <p className="truncate font-medium text-sm">{site.siteName}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span>{site.municipalityName}</span>
                    <span>{site.categoryName}</span>
                    <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tourist Visits Overview */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Tourist Visits</h3>
          <VisitsLineChart data={data.visitOverview} total={totalVisits} />
        </div>
      </div>

      {/* Bottom Row (3 columns) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heritage Sites Map */}
        <div className="rounded-xl border bg-card lg:col-span-1">
          <div className="p-5 pb-3">
            <h3 className="font-semibold">Heritage Sites Map</h3>
          </div>
          <div className="h-80">
            <HeritageMap markers={data.mapMarkers} />
          </div>
        </div>

        {/* Recommendation Performance */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Recommendation Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricBox
              label="Recommendations"
              value={data.recommendationPerformance.totalRecommendations}
            />
            <MetricBox
              label="Click-through Rate"
              value={`${data.recommendationPerformance.clickThroughRate}%`}
            />
            <MetricBox
              label="Route Plans"
              value={data.recommendationPerformance.routePlansCreated}
            />
            <MetricBox
              label="User Satisfaction"
              value="—"
            />
          </div>
          {/* TODO: User Satisfaction uses AVG(rating) from reviews table.
               The reviews table has rating, but tying it to recommendations
               specifically would require a join on site_id or tourist_id
               within the current month. No direct link exists between
               recommendations and reviews — stubbed for now. */}
        </div>

        {/* System Health */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">System Health</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Last Backup</p>
              {data.systemHealth.lastBackupAt ? (
                <p className="mt-0.5 font-medium text-sm">
                  {new Date(data.systemHealth.lastBackupAt).toLocaleString()}
                </p>
              ) : (
                <p className="mt-0.5 text-sm italic text-muted-foreground">
                  {/* TODO: no schema field for this yet — no backup has been recorded */}
                  No backups recorded
                </p>
              )}
              {data.systemHealth.lastBackupStatus && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <span className="inline-block size-1.5 rounded-full bg-current" />
                  {data.systemHealth.lastBackupStatus}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">System Version</p>
              <p className="mt-0.5 font-medium text-sm">
                {data.systemHealth.systemVersion ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Backup Type</p>
              <p className="mt-0.5 font-medium text-sm">
                {data.systemHealth.lastBackupType ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
    </Link>
  )
}

function MetricBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
