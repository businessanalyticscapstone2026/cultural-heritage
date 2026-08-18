"use client"

import { useCallback, useRef } from "react"
import { useReducedMotion } from "motion/react"

type PointerEventLike = React.PointerEvent<HTMLElement>

/**
 * Restrained mouse-follow parallax for card images.
 *
 * Tracks the pointer over the card root and translates the image wrapper a
 * few pixels opposite the cursor (±`strength` fraction of the card size) so
 * the image feels anchored to the cursor without revealing edges. Disabled
 * automatically under `prefers-reduced-motion`.
 */
export function useCardParallax(strength = 0.02) {
  const cardElement = useRef<HTMLElement | null>(null)
  const imageElement = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()

  const cardRef = useCallback((element: HTMLElement | null) => {
    cardElement.current = element
  }, [])

  const imageRef = useCallback((element: HTMLElement | null) => {
    imageElement.current = element
  }, [])

  const onPointerMove = useCallback(
    (event: PointerEventLike) => {
      if (reducedMotion) return
      const card = cardElement.current
      const image = imageElement.current
      if (!card || !image) return

      const bounds = card.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return

      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * strength * bounds.width
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * strength * bounds.height
      image.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    },
    [reducedMotion, strength],
  )

  const onPointerLeave = useCallback(() => {
    const image = imageElement.current
    if (image) image.style.transform = ""
  }, [])

  return { cardRef, imageRef, onPointerMove, onPointerLeave }
}