"use client"

import { useState } from "react"
import { useScroll, useMotionValueEvent } from "motion/react"

const SCROLLED_AT_Y = 8

export function useScrolled(): boolean {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > SCROLLED_AT_Y)
  })

  return scrolled
}
