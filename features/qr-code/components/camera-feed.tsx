"use client"

import { useEffect, useCallback, type RefObject } from "react"

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
}

export function CameraFeed({ videoRef, stream }: CameraFeedProps) {
  const safePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    // Ensure mobile inline playback requirements are satisfied
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    if (video.paused) {
      video.play().catch(() => {})
    }
  }, [videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Mobile WebKit / Blink inline playback attributes
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute("playsinline", "true")
    video.setAttribute("webkit-playsinline", "true")

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream
      }
      safePlay()
    } else {
      video.pause()
      video.srcObject = null
    }

    const handleVideoReady = () => {
      safePlay()
    }

    video.addEventListener("loadedmetadata", handleVideoReady)
    video.addEventListener("canplay", handleVideoReady)
    video.addEventListener("loadeddata", handleVideoReady)

    return () => {
      video.removeEventListener("loadedmetadata", handleVideoReady)
      video.removeEventListener("canplay", handleVideoReady)
      video.removeEventListener("loadeddata", handleVideoReady)
    }
  }, [videoRef, stream, safePlay])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      onLoadedMetadata={safePlay}
      onCanPlay={safePlay}
      className="absolute inset-0 size-full object-cover"
    />
  )
}
