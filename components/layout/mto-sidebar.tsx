import Link from "next/link"
import { LayoutDashboard, Landmark, FolderTree, Image, Map, Users, FileText, QrCode } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/mto/dashboard", icon: LayoutDashboard },
  { label: "Heritage Sites", href: "/mto/heritage-sites", icon: Landmark },
  { label: "Categories", href: "/mto/categories", icon: FolderTree },
  { label: "Media", href: "/mto/media", icon: Image },
  { label: "GIS", href: "/mto/gis", icon: Map },
  { label: "Tourist Monitoring", href: "/mto/tourist-monitoring", icon: Users },
  { label: "Reports", href: "/mto/reports", icon: FileText },
  { label: "QR Codes", href: "/mto/qr-codes", icon: QrCode },
]

export default function MTOSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
