"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { ReactNode } from "react"
import { EASE } from "@/lib/motion-variants"

const motionTags = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  article: motion.article,
  header: motion.header,
  aside: motion.aside,
} as const

type MotionTag = keyof typeof motionTags

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: MotionTag
  margin?: string
  amount?: number
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
  margin = "-80px",
  amount,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const Comp = motionTags[as]

  if (prefersReducedMotion) {
    return <Comp className={className}>{children}</Comp>
  }

  return (
    <Comp
      className={className}
      initial={y === 0 ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={y === 0 ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin, amount }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  as?: MotionTag
  staggerChildren?: number
  delayChildren?: number
  margin?: string
}

export function Stagger({
  children,
  className,
  as = "div",
  staggerChildren = 0.08,
  delayChildren = 0.05,
  margin = "-80px",
}: StaggerProps) {
  const prefersReducedMotion = useReducedMotion()
  const Comp = motionTags[as]

  if (prefersReducedMotion) {
    return <Comp className={className}>{children}</Comp>
  }

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren, delayChildren },
    },
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin }}
      variants={containerVariants}
    >
      {children}
    </Comp>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
  as?: MotionTag
  y?: number
}

export function StaggerItem({
  children,
  className,
  as = "div",
  y = 24,
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const Comp = motionTags[as]

  if (prefersReducedMotion) {
    return <Comp className={className}>{children}</Comp>
  }

  const itemVariants: Variants = {
    hidden: y === 0 ? { opacity: 0 } : { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE },
    },
  }

  return <Comp className={className} variants={itemVariants}>
    {children}
  </Comp>
}