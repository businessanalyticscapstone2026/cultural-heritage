"use client"

import { Flashlight, FlashlightOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TorchToggleProps {
  isTorchSupported: boolean
  isTorchOn: boolean
  onToggle: () => void
}

export function TorchToggle({ isTorchSupported, isTorchOn, onToggle }: TorchToggleProps) {
  if (!isTorchSupported) return null

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onToggle}
      className="pointer-events-auto size-10 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
      aria-label={isTorchOn ? "Turn off flashlight" : "Turn on flashlight"}
    >
      {isTorchOn ? (
        <FlashlightOff className="size-5" />
      ) : (
        <Flashlight className="size-5" />
      )}
    </Button>
  )
}
