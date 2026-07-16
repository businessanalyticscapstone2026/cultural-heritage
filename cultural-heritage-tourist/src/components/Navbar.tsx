import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Compass, Map, Info, User, Shield, Search, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AuthPrompt } from "@/components/AuthPrompt";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore" as const, label: "Explore", icon: Compass },
  { to: "/map" as const, label: "Map", icon: Map },
  { to: "/reviews" as const, label: "Reviews", icon: Star },
  { to: "/about" as const, label: "About", icon: Info },
];

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/explore", search: { q: searchQuery.trim() } });
      setSearchQuery("");
    }
  };

  return (
    <>
      <AuthPrompt
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign in to view your profile"
        description="Create a free account to save destinations, write reviews, and track your heritage journeys."
      />

      {/* Desktop header */}
      <header className="fixed inset-x-0 top-0 z-50 hidden bg-cream/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream transition-colors group-hover:bg-accent">
              <Shield size={16} strokeWidth={1.5} />
            </span>
            <span className="text-display text-lg tracking-tight">Batangas Heritage</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                link.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={
                    active
                      ? "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-accent transition-all"
                      : "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm text-ink-soft transition-all hover:text-ink"
                  }
                >
                  <link.icon size={14} strokeWidth={1.5} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                placeholder="Search sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-full border border-ink/10 bg-background py-1.5 pl-9 pr-3 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:w-64 transition-all"
              />
            </form>
            <button
              onClick={() => user ? navigate({ to: "/profile" }) : setShowAuthPrompt(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-parchment/40 text-ink transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              <User size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/8 bg-cream/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navLinks.map((tab) => {
            const active =
              tab.to === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${active ? "bg-ink text-cream" : "text-ink-soft"}`}>
                  <tab.icon
                    size={20}
                    strokeWidth={1.5}
                  />
                </span>
                <span
                  className={
                    active
                      ? "text-[10px] font-medium text-ink"
                      : "text-[10px] text-ink-soft"
                  }
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
