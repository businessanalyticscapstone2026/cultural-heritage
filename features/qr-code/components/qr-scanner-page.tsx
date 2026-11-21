"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCamera } from "../hooks/use-camera"
import { useQRScanner } from "../hooks/use-qr-scanner"
import { useScanHistory } from "../hooks/use-scan-history"
import {
  PermissionGate,
  CameraFeed,
  ScanTargetOverlay,
  TorchToggle,
  ManualEntryFallback,
  ScanErrorState,
  OfflineMessage,
  ScanHistory,
} from "../components"
import type { ScanResult } from "../types"

type ScanPhase = "camera" | "manual" | "resolving" | "error" | "offline"

export default function QRScannerPage() {
  const router = useRouter()
  const camera = useCamera()
  const { history, addScan, clearHistory } = useScanHistory()

  const initialPhase: ScanPhase =
    camera.permissionState === "denied" || camera.permissionState === "unavailable"
      ? "manual"
      : "camera"

  const [phase, setPhase] = useState<ScanPhase>(initialPhase)
  const [errorMessage, setErrorMessage] = useState("")
  const [manualMode, setManualMode] = useState(
    camera.permissionState === "denied" || camera.permissionState === "unavailable"
  )

  const handleDetect = useCallback(async (code: string) => {
    if (phase === "resolving") return

    setPhase("resolving")

    if (navigator.vibrate) {
      navigator.vibrate(100)
    }

    try {
      const res = await fetch("/api/qr/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data: ScanResult = await res.json()

      if (data.success && data.siteId) {
        addScan({
          siteId: data.siteId,
          siteName: data.siteName ?? "Unknown site",
          codeValue: code,
        })

        fetch("/api/qr/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            codeValue: code,
            siteId: data.siteId,
            deviceType: getDeviceType(),
          }),
        })

        router.push(`/heritage/${data.siteId}`)
      } else {
        setErrorMessage(data.message ?? "We couldn't recognize this code.")
        setPhase("error")
      }
    } catch {
      if (!navigator.onLine) {
        setPhase("offline")
      } else {
        setErrorMessage("Unable to scan right now. Please try again.")
        setPhase("error")
      }
    }
  }, [phase, addScan, router])

  const { state: scannerState, start: startScanner, stop: stopScanner } = useQRScanner({
    videoRef: camera.videoRef,
    onDetect: handleDetect,
    enabled: phase === "camera" && !manualMode && camera.permissionState === "granted",
  })

  const handleManualSubmit = useCallback(async (code: string) => {
    setPhase("resolving")
    await handleDetect(code)
  }, [handleDetect])

  const handleRetry = useCallback(() => {
    setPhase("camera")
    setManualMode(false)
    setErrorMessage("")
    startScanner()
  }, [startScanner])

  const handleShowManual = useCallback(() => {
    stopScanner()
    setManualMode(true)
    setPhase("manual")
  }, [stopScanner])

  const handleHistorySelect = useCallback((siteId: string) => {
    router.push(`/heritage/${siteId}`)
  }, [router])

  return (
    <div className="relative flex flex-1 flex-col -m-6 overflow-hidden bg-black">
      <PermissionGate
        permissionState={camera.permissionState}
        onRequestPermission={camera.requestPermission}
        onManualEntry={handleShowManual}
      >
        {phase !== "manual" && (
          <div className="relative flex-1">
            <CameraFeed videoRef={camera.videoRef} stream={camera.stream} />

            {phase === "camera" && !manualMode && (
              <ScanTargetOverlay isScanning={scannerState === "scanning" || scannerState === "detected"} />
            )}

            {phase === "resolving" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl bg-black/60 px-6 py-4 text-sm text-white backdrop-blur-sm">
                  Resolving code...
                </div>
              </div>
            )}

            <div className="pointer-events-auto absolute top-4 right-4 flex gap-2">
              <TorchToggle
                isTorchSupported={camera.isTorchSupported}
                isTorchOn={camera.isTorchOn}
                onToggle={camera.toggleTorch}
              />
            </div>

            {phase === "camera" && !manualMode && (
              <div className="pointer-events-auto absolute bottom-24 inset-x-0 flex justify-center">
                <button
                  onClick={handleShowManual}
                  className="rounded-full bg-black/40 px-4 py-2 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  Enter code manually
                </button>
              </div>
            )}

            {phase === "error" && (
              <ScanErrorState
                message={errorMessage}
                onRetry={handleRetry}
                onManualEntry={handleShowManual}
              />
            )}

            {phase === "offline" && <OfflineMessage />}
          </div>
        )}

        {phase === "manual" && (
          <ManualEntryFallback
            onSubmit={handleManualSubmit}
            isResolving={false}
          />
        )}
      </PermissionGate>

      <ScanHistory
        history={history}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
      />
    </div>
  )
}

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS Safari"
  if (/Android/.test(ua)) {
    if (/Chrome/.test(ua)) return "Android Chrome"
    if (/Samsung/.test(ua)) return "Android Samsung"
    return "Android Browser"
  }
  if (/Mac/.test(ua)) return "macOS"
  if (/Windows/.test(ua)) return "Windows"
  return "Unknown"
}
