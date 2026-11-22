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

export interface UseCameraOptions {
  enabled?: boolean
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { enabled = true } = options
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [permissionState, setPermissionState] = useState<CameraPermissionState>("prompt")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isTorchSupported, setIsTorchSupported] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")

  const acquireMediaStream = useCallback(async (facing: "environment" | "user"): Promise<MediaStream> => {
    const constraintAttempts: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      {
        video: {
          facingMode: { ideal: facing },
        },
        audio: false,
      },
      {
        video: true,
        audio: false,
      },
    ]

    let lastError: unknown = null
    for (const constraints of constraintAttempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        lastError = err
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          throw err
        }
      }
    }
    throw lastError
  }, [])

  const startStream = useCallback(async (facing: "environment" | "user") => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unavailable")
      return
    }

    try {
      const mediaStream = await acquireMediaStream(facing)

      setStream(mediaStream)
      setPermissionState("granted")

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(() => {})
      }

      try {
        const track = mediaStream.getVideoTracks()[0]
        const capabilities = track?.getCapabilities?.() as { torch?: boolean } | undefined
        setIsTorchSupported(!!capabilities?.torch)
      } catch {
        setIsTorchSupported(false)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermissionState("denied")
      } else {
        setPermissionState("unavailable")
      }
    }
  }, [acquireMediaStream])

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

  // Lifecycle control: stop tracks when disabled, probe permissions and start when enabled
  useEffect(() => {
    if (!enabled) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
        setStream(null)
      }
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unavailable")
      return
    }

    let isMounted = true

    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        if (!isMounted) return
        if (result.state === "granted") {
          startStream(facingMode)
        } else if (result.state === "denied") {
          setPermissionState("denied")
        }
      }).catch(() => {
        // Permissions API not supported — stay in "prompt" state
      })
    }

    return () => {
      isMounted = false
    }
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

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
