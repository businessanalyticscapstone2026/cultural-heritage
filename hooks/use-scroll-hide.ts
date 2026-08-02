"use client"

import { useState, useRef } from "react"
import { useScroll, useMotionValueEvent } from "motion/react"

const HIDE_AT_Y = 80

export function useScrollHide(): boolean {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y < lastY.current) {
      setHidden(false)
    } else if (y > lastY.current && y > HIDE_AT_Y) {
      setHidden(true)
    }
    lastY.current = y
  })

  return hidden
}
