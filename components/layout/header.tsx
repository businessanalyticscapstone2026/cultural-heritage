"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import LoginSelectorModal from "@/components/auth/login-selector-modal";

const navLinks = ["Home", "Explore", "Map", "Recommendations", "About"];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const loginButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <LoginSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        triggerRef={loginButtonRef}
      />

      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? "border-b border-border bg-card/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Compass
              className={`h-7 w-7 transition-colors ${
                scrolled || !isHome ? "text-primary" : "text-white"
              }`}
              strokeWidth={1.5}
            />
            <span
              className={`font-heading text-sm font-semibold uppercase leading-tight tracking-[0.2em] transition-colors ${
                scrolled || !isHome ? "text-primary" : "text-white"
              }`}
            >
              Batangas
              <br />
              Heritage
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((label) => {
              const href = label === "Home" ? "/" : `/${label.toLowerCase()}`
              const isActive =
                pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
              const solid = scrolled || !isHome

              let className: string
              if (isActive) {
                className = solid
                  ? "text-[15px] font-semibold text-primary"
                  : "text-[15px] font-semibold text-white"
              } else {
                className = solid
                  ? "text-[15px] font-medium text-primary/70 hover:text-primary"
                  : "text-[15px] font-medium text-white/60 hover:text-white"
              }

              return (
                <Link key={label} href={href} className={className}>
                  {label}
                </Link>
              )
            })}
          </nav>

          <button
            ref={loginButtonRef}
            type="button"
            onClick={() => setModalOpen(true)}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              scrolled || !isHome
                ? "bg-primary text-white hover:opacity-90"
                : "border border-white/60 text-white hover:bg-white hover:text-primary"
            }`}
          >
            Login
          </button>
        </div>
      </header>
    </>
  );
}
