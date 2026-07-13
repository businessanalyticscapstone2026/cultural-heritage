"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export type QRScannerState = "idle" | "scanning" | "detected" | "error"

interface UseQRScannerOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>
  onDetect: (code: string) => void
  enabled?: boolean
}

interface UseQRScannerReturn {
  state: QRScannerState
  start: () => void
  stop: () => void
}

export function useQRScanner({ videoRef, onDetect, enabled = true }: UseQRScannerOptions): UseQRScannerReturn {
  const [state, setState] = useState<QRScannerState>("idle")
  const animationFrameRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const lastDetectionRef = useRef(0)
  const onDetectRef = useRef(onDetect)

  useEffect(() => {
    onDetectRef.current = onDetect
  }, [onDetect])

  const detectWithBarcodeAPI = useCallback(async (video: HTMLVideoElement): Promise<string | null> => {
    const BarcodeDetectorClass = (globalThis as Record<string, unknown>).BarcodeDetector as
      | (new (options: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> })
      | undefined
    if (!BarcodeDetectorClass) return null

    try {
      const detector = new BarcodeDetectorClass({ formats: ["qr_code"] })
      const bitmap = await detector.detect(video)
      if (bitmap.length > 0) {
        return bitmap[0].rawValue
      }
    } catch {
      // BarcodeDetection API failed
    }
    return null
  }, [])

  const processFrame = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return

    const now = Date.now()
    if (now - lastDetectionRef.current < 1000) return

    const code = await detectWithBarcodeAPI(video)
    if (code) {
      lastDetectionRef.current = now
      setState("detected")
      onDetectRef.current(code)
      setTimeout(() => {
        if (isRunningRef.current) {
          setState("scanning")
        }
      }, 2000)
    }
  }, [videoRef, detectWithBarcodeAPI])

  const start = useCallback(() => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    setState("scanning")

    const loop = async () => {
      if (!isRunningRef.current) return
      await processFrame()
      animationFrameRef.current = requestAnimationFrame(loop)
    }
    animationFrameRef.current = requestAnimationFrame(loop)
  }, [processFrame])

  const stop = useCallback(() => {
    isRunningRef.current = false
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setState("idle")
  }, [])

  useEffect(() => {
    if (enabled && state === "idle") {
      start()
    }
    return () => stop()
  }, [enabled, state, start, stop])

  return { state, start, stop }
}
