import { Link } from "@tanstack/react-router";

const exploreLinks = [
  { to: "/explore" as const, label: "Destinations" },
  { to: "/map" as const, label: "GIS Map" },
  { to: "/route-planner" as const, label: "Routes" },
  { to: "/explore" as const, label: "Categories" },
];

const travelerLinks = [
  { to: "/bookmarks" as const, label: "Bookmarks" },
  { to: "/reviews" as const, label: "Reviews" },
  { to: "/scanner" as const, label: "QR Scanner" },
  { to: "/profile" as const, label: "Profile" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" />
                </svg>
              </span>
              <span className="text-display text-lg tracking-tight">
                Batangas Heritage
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              A living atlas of cultural heritage — mapping the places, stories,
              and journeys worth remembering.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-display text-sm text-ink">Explore</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-soft transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Traveler */}
          <div>
            <h3 className="text-display text-sm text-ink">Traveler</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {travelerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-soft transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ink-soft md:flex-row md:px-10">
          <p>© 2026 Batangas Heritage Atlas</p>
          <p className="font-mono uppercase tracking-widest">
            Est. MMXXVI · Trails of Memory
          </p>
        </div>
      </div>
    </footer>
  );
}
