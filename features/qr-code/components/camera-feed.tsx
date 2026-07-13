"use client"

import { useEffect, type RefObject } from "react"

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>
}

export function CameraFeed({ videoRef }: CameraFeedProps) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      video.play().catch(() => {})
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata)
  }, [videoRef])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 size-full object-cover"
    />
  )
}
