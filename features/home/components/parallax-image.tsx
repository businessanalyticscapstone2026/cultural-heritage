"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"

interface ParallaxImageProps {
  src: string | null
  alt: string
  className?: string
  imgClassName?: string
  imageRef?: (element: HTMLElement | null) => void
  placeholder?: ReactNode
}

/**
 * Card image with a restrained hover zoom on a wrapper that carries the
 * mouse-follow parallax transform (driven by `useCardParallax`).
 *
 * `className` positions the wrapper (e.g. `absolute inset-0 h-full w-full`);
 * the inner image always fills it and zooms gently on group hover, leaving
 * overscan for the parallax translate.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  imageRef,
  placeholder,
}: ParallaxImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        ref={imageRef}
        className={`flex items-center justify-center bg-ink/20 ${className ?? ""}`}
        aria-hidden
      >
        {placeholder}
      </div>
    )
  }

  return (
    <div
      ref={imageRef}
      className={`will-change-transform transition-transform duration-300 ease-out ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className={`object-cover transition-transform duration-[1200ms] group-hover:scale-[1.08] ${
          imgClassName ?? ""
        }`}
        onError={() => setHasError(true)}
      />
    </div>
  )
}