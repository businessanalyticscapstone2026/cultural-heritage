"use client"

import { useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const SHOW_AFTER_Y = 400

export function BackToTop() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useMotionValueEvent(scrollY, "change", (y) => {
    setVisible(y > SHOW_AFTER_Y)
  })

  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Back to top"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed z-40 flex h-12 w-12 items-center justify-center rounded-full",
            "bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
            "bottom-4 right-4 md:bottom-6 md:right-6",
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
