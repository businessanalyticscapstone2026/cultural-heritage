import PublicNavbar from "@/components/layout/public-navbar"
import { QRScannerFAB } from "@/features/qr-code/components"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen bg-background text-ink overflow-x-hidden">{children}</main>
      <PublicFooter />
      <QRScannerFAB />
    </>
  )
}

function PublicFooter() {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" />
                </svg>
              </span>
              <span className="text-display text-lg tracking-tight">Batangas Heritage</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              A living atlas of cultural heritage — mapping the places, stories,
              and journeys worth remembering.
            </p>
          </div>
          <div>
            <h3 className="text-display text-sm text-ink">Explore</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[{ href: "/explore", label: "Destinations" }, { href: "/map", label: "GIS Map" }, { href: "/routes", label: "Routes" }, { href: "/explore?category=all", label: "Categories" }].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-soft transition-colors hover:text-accent">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-display text-sm text-ink">Traveler</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[{ href: "/login", label: "Bookmarks" }, { href: "/login", label: "Recommendations" }, { href: "/login", label: "QR Scanner" }, { href: "/login", label: "Profile" }].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-soft transition-colors hover:text-accent">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ink-soft md:flex-row md:px-10">
          <p>&copy; 2026 Batangas Heritage Atlas</p>
          <p className="font-mono uppercase tracking-widest">Est. MMXXVI &middot; Trails of Memory</p>
        </div>
      </div>
    </footer>
  )
}
