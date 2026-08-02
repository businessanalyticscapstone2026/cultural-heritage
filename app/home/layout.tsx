import { cookies } from "next/headers"
import { HomeNavbar } from "@/components/layout/home-navbar"
import { createClient } from "@/utils/supabase/server"
import QRScannerFAB from "@/features/qr-code/components/qr-scanner-fab"
import { FooterContact } from "@/components/layout/footer-contact"

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen bg-background text-ink overflow-x-hidden pt-14 md:pt-0">{children}</main>
      <QRScannerFAB />
      <HomeSiteFooter isAuthenticated={!!user} />
    </>
  )
}

function HomeSiteFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <a href="/home" className="flex items-center gap-2">
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
              {[{ href: "/home/explore", label: "Destinations" }, { href: "/home/map", label: "GIS Map" }, { href: "/routes", label: "Routes" }, { href: "/home/explore?category=all", label: "Categories" }].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-soft transition-colors hover:text-accent">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          {isAuthenticated && (
            <div>
              <h3 className="text-display text-sm text-ink">Traveler</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {[{ href: "/saved", label: "Bookmarks" }, { href: "/recommendations", label: "Recommendations" }, { href: "/scan", label: "QR Scanner" }, { href: "/profile", label: "Profile" }].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ink-soft transition-colors hover:text-accent">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <FooterContact />
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
