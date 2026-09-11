"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Landmark,
  FolderTree,
  Archive,
  Image,
  Map,
  Activity,
  BarChart3,
  FileText,
  QrCode,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import { BrandLogo } from "@/components/brand/brand-logo"

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
      { label: "Dashboard", href: ROUTES.MTO.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    label: "Heritage Information Management",
    items: [
      { label: "Heritage Sites", href: ROUTES.MTO.SITES, icon: Landmark },
      { label: "Categories", href: ROUTES.MTO.CATEGORIES, icon: FolderTree },
      { label: "Archive", href: ROUTES.MTO.ARCHIVE, icon: Archive },
    ],
  },
  {
    label: "Media Management",
    items: [
      { label: "Media Library", href: ROUTES.MTO.MEDIA, icon: Image },
    ],
  },
  {
    label: "GIS Management",
    items: [
      { label: "GIS Map", href: ROUTES.MTO.GIS, icon: Map },
    ],
  },
  {
    label: "Tourist Monitoring",
    items: [
      { label: "Tourist Monitoring", href: ROUTES.MTO.TOURIST_MONITORING, icon: Activity },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [
      { label: "Analytics Dashboard", href: ROUTES.MTO.ANALYTICS, icon: BarChart3 },
      { label: "Reports", href: ROUTES.MTO.REPORTS, icon: FileText },
    ],
  },
  {
    label: "QR Code Management",
    items: [
      { label: "QR Codes", href: ROUTES.MTO.QR_CODES, icon: QrCode },
    ],
  },
  {
    label: "User Management",
    items: [
      { label: "Users", href: ROUTES.MTO.USERS, icon: Users },
    ],
  },
]

export default function MTOSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2.5 border-b px-4 py-4">
        <BrandLogo variant="white" className="size-8" />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight tracking-tight text-sidebar-foreground">MTO PORTAL</p>
          <p className="text-[10px] leading-tight text-sidebar-foreground/80">Municipal Tourism Office</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            {group.label !== "Dashboard" && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
