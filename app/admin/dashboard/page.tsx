import Link from "next/link"
import { formatDistanceToNow } from "@/lib/format-time"
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
  Sparkles,
  MousePointerClick,
  Route,
  Star,
  Clock,
  ShieldCheck,
} from "lucide-react"
import { getDashboardData } from "@/features/dashboard/services"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { VisitsLineChart } from "@/components/dashboard/visits-line-chart"
import { HeritageMap } from "@/components/dashboard/heritage-map"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal"
import { formatCategoryName } from "@/lib/format-category"

export default async function AdminDashboardPage() {
  const data = await getDashboardData()
  const totalCategoryCount = data.categoryBreakdown.reduce((acc, c) => acc + c.count, 0)
  const totalVisits = data.visitOverview.reduce((acc, v) => acc + v.count, 0)

  const heritageDelta = data.kpis.heritageSites.value - data.kpis.heritageSites.previous
  const municipalityDelta =
    data.kpis.activeMunicipalities.value - data.kpis.activeMunicipalities.previous
  const usersDelta = data.kpis.registeredUsers.value - data.kpis.registeredUsers.previous

  const monthlyFootnote = (delta: number) =>
    delta > 0 ? `+${delta} this month` : delta < 0 ? `${delta} this month` : "No change this month"

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Tourism Cultural Decision Support System</h1>
        <p className="mt-1 text-sm opacity-80">PTCAO Administrator Dashboard</p>
      </div>

      {/* KPI Cards */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard
            icon={<Landmark className="size-4" />}
            label="Total Heritage Sites"
            value={data.kpis.heritageSites.value}
            previous={data.kpis.heritageSites.previous}
            accent="primary"
            footnote={monthlyFootnote(heritageDelta)}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            icon={<Building2 className="size-4" />}
            label="Active Municipalities"
            value={data.kpis.activeMunicipalities.value}
            previous={data.kpis.activeMunicipalities.previous}
            accent="secondary"
            footnote={monthlyFootnote(municipalityDelta)}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            icon={<Users className="size-4" />}
            label="Registered Users"
            value={data.kpis.registeredUsers.value}
            previous={data.kpis.registeredUsers.previous}
            accent="success"
            footnote={monthlyFootnote(usersDelta)}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            icon={<CalendarCheck className="size-4" />}
            label="Visitors This Month"
            value={data.kpis.visitsThisMonth.value}
            previous={data.kpis.visitsThisMonth.previous}
            accent="warning"
            sparkline={data.visitOverview}
            footnote={`Last month: ${data.kpis.visitsThisMonth.previous.toLocaleString()}`}
          />
        </StaggerItem>
      </Stagger>

      {/* Quick Actions */}
      <Reveal>
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
      </Reveal>

      {/* Row 2: GIS Spatial Overview (Full-Width Showcase) */}
      <Reveal>
        <div className="flex flex-col rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Heritage Sites Map</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {data.mapMarkers.length} {data.mapMarkers.length === 1 ? "site" : "sites"} mapped
              </span>
            </div>
            <Link
              href="/admin/gis-admin"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>Open GIS Admin</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="h-[450px] sm:h-[550px] lg:h-[640px] w-full p-2 pt-0">
            <HeritageMap markers={data.mapMarkers} />
          </div>
        </div>
      </Reveal>

      {/* Row 3: Analytics & Site Breakdown (Visits 2 cols, Donut 1 col) */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tourist Visits Overview */}
          <div className="flex flex-col rounded-xl border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Tourist Visits Overview</h3>
                <p className="text-xs text-muted-foreground">30-day QR code scan activity and trend</p>
              </div>
              <Link
                href="/admin/decision-support"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <span>Reports</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <VisitsLineChart data={data.visitOverview} total={totalVisits} heightClassName="h-60" />
          </div>

          {/* Heritage Sites by Category (Donut Chart) */}
          <div className="flex flex-col rounded-xl border bg-card p-5 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Heritage Sites by Category</h3>
              <Link
                href="/admin/heritage-repository"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                <span>View all</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <DonutChart data={data.categoryBreakdown} total={totalCategoryCount} />
          </div>
        </div>
      </Reveal>

      {/* Row 4: Operational Status & System Health (3 columns) */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recently Added Heritage Sites */}
          <div className="flex flex-col rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Recently Added</h3>
              <Link
                href="/admin/heritage-repository"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                <span>Repository</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
            {data.recentSites.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No heritage sites yet</p>
            ) : (
              <ul className="space-y-3">
                {data.recentSites.map((site) => (
                  <li key={site.id} className="border-border border-b pb-3 last:border-0 last:pb-0">
                    <p className="truncate font-medium text-sm">{site.siteName}</p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span>{site.municipalityName}</span>
                      <span className="font-medium text-foreground/80">{formatCategoryName(site.categoryName)}</span>
                      <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommendation Performance */}
          <div className="flex flex-col rounded-xl border bg-card p-5">
            <h3 className="mb-4 font-semibold">Recommendation Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <MetricBox
                icon={Sparkles}
                label="Recommendations"
                value={data.recommendationPerformance.totalRecommendations}
              />
              <MetricBox
                icon={MousePointerClick}
                label="Click-through Rate"
                value={`${data.recommendationPerformance.clickThroughRate}%`}
                progress={data.recommendationPerformance.clickThroughRate}
                progressTone="success"
              />
              <MetricBox
                icon={Route}
                label="Route Plans"
                value={data.recommendationPerformance.routePlansCreated}
              />
              <MetricBox
                icon={Star}
                label="User Satisfaction"
                value={
                  data.recommendationPerformance.userSatisfaction.reviewCount > 0
                    ? `${data.recommendationPerformance.userSatisfaction.average}/5`
                    : "—"
                }
                progress={
                  data.recommendationPerformance.userSatisfaction.reviewCount > 0
                    ? data.recommendationPerformance.userSatisfaction.percent
                    : undefined
                }
                progressTone="success"
              />
            </div>
          </div>

          {/* System Health */}
          <div className="flex flex-col rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">System Health</h3>
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                <span>Settings</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Last Backup</p>
                  {data.systemHealth.lastBackupAt ? (
                    <p className="mt-0.5 font-medium text-sm">
                      {formatDistanceToNow(new Date(data.systemHealth.lastBackupAt))}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({new Date(data.systemHealth.lastBackupAt).toLocaleString()})
                      </span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm italic text-muted-foreground">
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
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">System Version</p>
                  <p className="mt-0.5 font-medium text-sm">
                    {data.systemHealth.systemVersion ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Database className="size-4" />
                </span>
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
      </Reveal>
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
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition-colors hover:bg-sidebar hover:text-accent-foreground"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
    </Link>
  )
}

function MetricBox({
  icon: Icon,
  label,
  value,
  progress,
  progressTone = "secondary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  progress?: number
  progressTone?: "success" | "secondary"
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums">{value}</p>
      {progress != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className={
              progressTone === "success"
                ? "h-full rounded-full bg-success"
                : "h-full rounded-full bg-secondary"
            }
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
