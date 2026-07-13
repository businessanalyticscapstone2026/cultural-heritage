"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Users, Landmark, Map, BarChart3, FileText, Shield, Settings, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Municipalities", href: "/admin/municipalities", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Heritage Repository", href: "/admin/heritage-repository", icon: Landmark },
  { label: "GIS Admin", href: "/admin/gis-admin", icon: Map },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Decision Support", href: "/admin/decision-support", icon: FileText },
  { label: "Data Governance", href: "/admin/data-governance", icon: Shield },
  { label: "Audit Trail", href: "/admin/audit-trail", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
