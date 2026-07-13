"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  Landmark,
  Map,
  BarChart3,
  FileText,
  ShieldCheck,
  ScrollText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    label: "Heritage & Data",
    items: [
      { label: "Municipalities", href: ROUTES.ADMIN.MUNICIPALITIES, icon: Building2 },
      { label: "Heritage Repository", href: ROUTES.ADMIN.HERITAGE, icon: Landmark },
      { label: "GIS Administration", href: ROUTES.ADMIN.GIS, icon: Map },
    ],
  },
  {
    label: "Analytics & Decision Support",
    items: [
      { label: "Analytics Dashboard", href: ROUTES.ADMIN.ANALYTICS, icon: BarChart3 },
      { label: "Decision Support", href: ROUTES.ADMIN.DECISION_SUPPORT, icon: FileText },
      { label: "Data Governance", href: ROUTES.ADMIN.DATA_GOVERNANCE, icon: ShieldCheck },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Users", href: ROUTES.ADMIN.USERS, icon: Users },
      { label: "Audit Trail", href: ROUTES.ADMIN.AUDIT_TRAIL, icon: ScrollText },
      { label: "Settings", href: ROUTES.ADMIN.SETTINGS, icon: Settings },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2.5 border-b px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight tracking-tight">PTCAO PORTAL</p>
          <p className="text-[10px] leading-tight text-sidebar-foreground/60">Provincial Tourism Office</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {group.label !== "Dashboard" && (
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive(item.href) &&
                    "bg-primary text-primary-foreground font-medium"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
