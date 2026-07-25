"use client"

import type { CameraPermissionState } from "../hooks/use-camera"
import { Camera, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PermissionGateProps {
  permissionState: CameraPermissionState
  onRequestPermission: () => void
  onManualEntry: () => void
  children: React.ReactNode
}

export function PermissionGate({
  permissionState,
  onRequestPermission,
  onManualEntry,
  children,
}: PermissionGateProps) {
  if (permissionState === "granted") {
    return <>{children}</>
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background text-center">
      {permissionState === "denied" ? (
        <>
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <CameraOff className="size-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Camera access denied
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              To scan QR codes, please enable camera access in your browser settings.
              You can also enter the code manually.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onManualEntry}>
              Enter code manually
            </Button>
            <Button onClick={onRequestPermission}>
              Try again
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Camera className="size-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Camera access required
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Allow camera access to scan QR codes at heritage sites.
              No images are stored or transmitted.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onManualEntry}>
              Enter code manually
            </Button>
            <Button onClick={onRequestPermission}>
              Enable camera
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
