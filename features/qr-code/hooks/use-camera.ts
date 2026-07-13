"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export type CameraPermissionState = "prompt" | "granted" | "denied" | "unavailable"

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  permissionState: CameraPermissionState
  stream: MediaStream | null
  isTorchSupported: boolean
  isTorchOn: boolean
  requestPermission: () => Promise<void>
  toggleTorch: () => Promise<void>
  switchCamera: () => Promise<void>
  facingMode: "environment" | "user"
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [permissionState, setPermissionState] = useState<CameraPermissionState>("prompt")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isTorchSupported, setIsTorchSupported] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")

  const startStream = useCallback(async (facing: "environment" | "user") => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unavailable")
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      })

      setStream(mediaStream)
      setPermissionState("granted")

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      const track = mediaStream.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as { torch?: boolean }
      setIsTorchSupported(!!capabilities.torch)
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermissionState("denied")
      } else {
        setPermissionState("unavailable")
      }
    }
  }, [])

  const requestPermission = useCallback(async () => {
    await startStream(facingMode)
  }, [facingMode, startStream])

  const toggleTorch = useCallback(async () => {
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return

    const newTorchState = !isTorchOn
    await track.applyConstraints({ advanced: [{ torch: newTorchState } as MediaTrackConstraintSet] })
    setIsTorchOn(newTorchState)
  }, [stream, isTorchOn])

  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === "environment" ? "user" : "environment"
    setFacingMode(newFacing)

    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    await startStream(newFacing)
  }, [facingMode, stream, startStream])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stream])

  return {
    videoRef,
    permissionState,
    stream,
    isTorchSupported,
    isTorchOn,
    requestPermission,
    toggleTorch,
    switchCamera,
    facingMode,
  }
}
