"use client"

import { useState } from "react"
import Image from "next/image"
import { Landmark } from "lucide-react"

interface SiteThumbnailProps {
  src?: string | null
  alt?: string
  className?: string
  iconClassName?: string
  sizes?: string
}

export default function SiteThumbnail({
  src,
  alt = "",
  className = "size-10 rounded-lg",
  iconClassName = "size-5 text-muted-foreground/60",
  sizes = "40px",
}: SiteThumbnailProps) {
  const [hasError, setHasError] = useState(false)

  const showImage = Boolean(src) && !hasError

  return (
    <div
      className={`relative shrink-0 bg-muted overflow-hidden flex items-center justify-center ${className}`}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Landmark className={iconClassName} />
      )}
    </div>
  )
}
