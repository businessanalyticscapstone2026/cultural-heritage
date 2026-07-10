"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = ["Home", "Explore", "Map", "Recommendations", "About"];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-card/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Compass
            className={`h-7 w-7 transition-colors ${
              scrolled ? "text-primary" : "text-white"
            }`}
            strokeWidth={1.5}
          />
          <span
            className={`font-heading text-sm font-semibold uppercase leading-tight tracking-[0.2em] transition-colors ${
              scrolled ? "text-primary" : "text-white"
            }`}
          >
            Batangas
            <br />
            Heritage
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((label) => (
            <Link
              key={label}
              href={label === "Home" ? "/" : `/${label.toLowerCase()}`}
              className={`text-[15px] font-medium transition-colors ${
                scrolled
                  ? "text-primary hover:opacity-70"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
            scrolled
              ? "bg-primary text-white hover:opacity-90"
              : "border border-white/60 text-white hover:bg-white hover:text-primary"
          }`}
        >
          Login
        </Link>
      </div>
    </header>
  );
}
