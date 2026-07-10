"use client"

import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X, ChevronRight, MapPin, Building2, Shield } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface RoleCard {
  icon: typeof MapPin
  title: string
  description: string
  href: string
}

const roles: RoleCard[] = [
  {
    icon: MapPin,
    title: "Tourist",
    description: "Explore heritage sites and get personalized recommendations.",
    href: "/login",
  },
  {
    icon: Building2,
    title: "Municipal Tourism Office",
    description: "Manage heritage records for your municipality.",
    href: "/mto/login",
  },
  {
    icon: Shield,
    title: "System Administrator",
    description: "Provincial-level system administration.",
    href: "/ptcao/login",
  },
]

interface LoginSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

export default function LoginSelectorModal({ isOpen, onClose, triggerRef }: LoginSelectorModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const headingId = "login-selector-heading"

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href)
      onClose()
    },
    [router, onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    firstFocusable?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable?.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable?.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    const trigger = triggerRef?.current
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      trigger?.focus()
    }
  }, [isOpen, onClose, triggerRef])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[480px] mx-4 bg-card rounded-2xl shadow-2xl border border-border"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-heading hover:bg-muted/20 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              {/* Heading */}
              <h1 id={headingId} className="text-2xl font-bold text-heading">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted mt-1.5 mb-6">Select your role to continue</p>

              {/* Role cards */}
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.href}
                    type="button"
                    onClick={() => handleNavigate(role.href)}
                    className="w-full flex items-center gap-3 text-left border border-gray-200 rounded-xl p-3.5 hover:border-gray-400 hover:bg-gray-50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EAF2FB] flex items-center justify-center shrink-0">
                      <role.icon className="w-5 h-5 text-[#1D5FA8]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-heading">{role.title}</span>
                      <span className="block text-xs text-muted mt-0.5">{role.description}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted shrink-0 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>

              {/* Divider + Register link */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-body text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="text-secondary font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    Register as a Tourist
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
