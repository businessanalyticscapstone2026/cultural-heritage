"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { EASE } from "@/lib/motion-variants"

export function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
