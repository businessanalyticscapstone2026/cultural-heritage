import Link from "next/link";
import { Compass, Globe, MessageCircle, ExternalLink } from "lucide-react";

const footerColumns = [
  {
    title: "Quick Links",
    links: ["Home", "Explore", "Map", "Recommendations", "About"],
  },
  {
    title: "Resources",
    links: [
      "Heritage 101",
      "Events",
      "Travel Guide",
      "News & Updates",
      "Contact Us",
    ],
  },
  { title: "Support", links: ["FAQ", "Privacy Policy", "Terms of Use"] },
] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-primary text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8 lg:px-10">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-white" strokeWidth={1.5} />
            <span className="font-heading text-sm font-semibold uppercase leading-tight tracking-[0.2em] text-white">
              Batangas
              <br />
              Heritage
            </span>
          </Link>
          <p className="mt-4 max-w-[220px] text-sm">
            Preserving our past, inspiring our future.
          </p>
          <div className="mt-5 flex gap-4">
            <Link href="#" aria-label="Facebook" className="hover:text-white">
              <Globe className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Instagram" className="hover:text-white">
              <MessageCircle className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Twitter" className="hover:text-white">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href={
                      link === "Home"
                        ? "/"
                        : `/${link.toLowerCase().replace(/\s+/g, "-")}`
                    }
                    className="text-sm hover:text-white"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="mx-auto max-w-7xl px-6 text-center text-xs text-white/50 lg:px-10">
          &copy; 2026 Batangas Heritage. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
