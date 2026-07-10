import Link from "next/link"
import { LayoutDashboard, Compass, Map, Route, Star, Heart, User } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/tourist/dashboard", icon: LayoutDashboard },
  { label: "Explore", href: "/tourist/explore", icon: Compass },
  { label: "Map", href: "/tourist/map", icon: Map },
  { label: "Recommendations", href: "/tourist/recommendations", icon: Star },
  { label: "Routes", href: "/tourist/routes", icon: Route },
  { label: "Saved", href: "/tourist/saved", icon: Heart },
  { label: "Profile", href: "/tourist/profile", icon: User },
]

export default function TouristSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <Compass className="size-5 text-primary" />
        <span className="text-sm font-semibold">Batangas Heritage</span>
      </div>
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
