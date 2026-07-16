"use client"

import { motion, AnimatePresence } from "motion/react"
import { X, Lock } from "lucide-react"
import Link from "next/link"

interface AuthPromptModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
}

export default function AuthPromptModal({ open, onClose, title, description }: AuthPromptModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-ink/10 bg-background p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X size={16} />
            </button>

            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent">
              <Lock size={24} strokeWidth={1.4} />
            </div>

            <h2 className="text-display text-2xl text-center text-ink">{title}</h2>
            <p className="mt-3 text-center text-sm text-ink-soft">{description}</p>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-ink px-6 py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
                onClick={onClose}
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-ink/15 px-6 py-3 text-center text-sm text-ink transition-colors hover:border-ink/30"
                onClick={onClose}
              >
                Already have an account? Log in
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-ink-soft/60">
              Free to join &middot; No credit card required
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
