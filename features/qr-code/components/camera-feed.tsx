"use client"

import { useEffect, type RefObject } from "react"

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
}

export function CameraFeed({ videoRef, stream }: CameraFeedProps) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (stream && video.srcObject !== stream) {
      video.srcObject = stream
    }

    const handleLoadedMetadata = () => {
      video.play().catch(() => {})
    }

    if (video.srcObject && video.readyState >= 2) {
      video.play().catch(() => {})
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata)
  }, [videoRef, stream])

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
