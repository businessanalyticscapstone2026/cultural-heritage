"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Compass, Map, Info, User, Search, Star } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useScrollHide } from "@/hooks/use-scroll-hide"
import { useScrolled } from "@/hooks/use-scrolled"
import AuthPromptModal from "@/components/auth/auth-prompt-modal"
import { BrandLogo } from "@/components/brand/brand-logo"

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  {
    href: "/map",
    label: "Map",
    icon: Map,
    requiresAuth: true,
    promptTitle: "Sign in to view the map",
    promptDescription: "Explore heritage sites across the First District of Batangas with our interactive GIS map.",
  },
  {
    href: "/reviews",
    label: "Reviews",
    icon: Star,
    requiresAuth: true,
    promptTitle: "Sign in to view reviews",
    promptDescription: "Create a free account to read and share stories from heritage explorers in Batangas.",
  },
  { href: "/about", label: "About", icon: Info },
]

type NavLink = (typeof navLinks)[number]

export default function PublicNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const hidden = useScrollHide()
  const scrolled = useScrolled()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<object | null>(null)
  const [authModal, setAuthModal] = useState<{ open: boolean; title: string; description: string }>({
    open: false, title: "", description: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus()
    }
  }, [mobileSearchOpen])

  useEffect(() => {
    if (desktopSearchOpen && desktopSearchRef.current) {
      desktopSearchRef.current.focus()
    }
  }, [desktopSearchOpen])

  const showAuthPrompt = (title: string, description: string) => {
    setAuthModal({ open: true, title, description })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setMobileSearchOpen(false)
      setDesktopSearchOpen(false)
    }
  }

  const handleNavClick = (e: React.MouseEvent, link: NavLink) => {
    if (link.requiresAuth && !user) {
      e.preventDefault()
      showAuthPrompt(link.promptTitle ?? "", link.promptDescription ?? "")
    }
  }

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(`/explore?q=${encodeURIComponent(q)}`)
      setSearchQuery("")
      setMobileSearchOpen(false)
    }
  }

  const visibleLinks = navLinks

  return (
    <>
      <AuthPromptModal
        open={authModal.open}
        onClose={() => setAuthModal({ open: false, title: "", description: "" })}
        title={authModal.title}
        description={authModal.description}
      />

      {/* Mobile top bar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-cream/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)] transition-transform duration-300 md:hidden ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-1.5">
            <BrandLogo variant="light" className="size-8" />
            <span className="text-display text-base leading-none tracking-tight">Batangas Heritage</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {mobileSearchOpen ? (
              <form onSubmit={handleMobileSearchSubmit} className="flex items-center gap-1.5">
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder="Search sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery.trim()) setMobileSearchOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchQuery("")
                      setMobileSearchOpen(false)
                    }
                  }}
                  className="w-40 rounded-full border border-ink/10 bg-background py-1.5 pl-3 pr-2 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40"
                />
              </form>
            ) : (
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            )}
            {user ? (
              <Link
                href="/profile"
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <User size={16} strokeWidth={1.5} />
              </Link>
            ) : (
              <button
                onClick={() =>
                  showAuthPrompt(
                    "Sign in to view your profile",
                    "Create a free account to save destinations, write reviews, and track your heritage journeys.",
                  )
                }
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <User size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Desktop header */}
      <header
        className={`sticky inset-x-0 top-0 z-50 hidden transition-all duration-300 md:block ${hidden ? "-translate-y-full" : "translate-y-0"} ${scrolled ? "bg-cream/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]" : ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="light" className="size-9" />
            <span className="text-display text-lg leading-none tracking-tight">Batangas Heritage</span>
          </Link>

          <nav className="flex items-center gap-1.5">
            {visibleLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={
                    active
                      ? "group relative flex items-center gap-2 rounded-full px-3.5 py-1 text-display text-[15px] font-medium leading-none text-accent transition-colors duration-300"
                      : "group relative flex items-center gap-2 rounded-full px-3.5 py-1 text-display text-[15px] leading-none text-ink-soft transition-colors duration-300 hover:text-ink"
                  }
                >
                  <link.icon size={14} strokeWidth={1.25} />
                  {link.label}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-px rounded-full bg-accent transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {desktopSearchOpen ? (
              <form onSubmit={handleSearch} className="relative hidden lg:block">
                <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  ref={desktopSearchRef}
                  type="text"
                  placeholder="Search sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery.trim()) setDesktopSearchOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchQuery("")
                      setDesktopSearchOpen(false)
                    }
                  }}
                  className="w-48 rounded-full border border-ink/10 bg-background py-1.5 pl-9 pr-3 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40"
                />
              </form>
            ) : (
              <button
                onClick={() => setDesktopSearchOpen(true)}
                className="hidden h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent lg:grid"
                aria-label="Search sites"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            )}
            {user ? (
              <Link
                href="/profile"
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <User size={16} strokeWidth={1.5} />
              </Link>
            ) : (
              <button
                onClick={() =>
                  showAuthPrompt(
                    "Sign in to view your profile",
                    "Create a free account to save destinations, write reviews, and track your heritage journeys.",
                  )
                }
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <User size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/8 bg-cream/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {visibleLinks.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                onClick={(e) => handleNavClick(e, tab)}
                className="flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${active ? "bg-ink text-cream" : "text-ink-soft"}`}>
                  <tab.icon size={20} strokeWidth={1.5} />
                </span>
                <span className={active ? "text-[11px] font-medium text-ink text-display" : "text-[11px] text-ink-soft text-display"}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
