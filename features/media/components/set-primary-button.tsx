"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SetPrimaryButtonProps {
  mediaId: string
  isPrimary: boolean
  onSetPrimary: (mediaId: string) => void
  disabled?: boolean
}

export default function SetPrimaryButton({
  mediaId,
  isPrimary,
  onSetPrimary,
  disabled,
}: SetPrimaryButtonProps) {
  if (isPrimary) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onSetPrimary(mediaId)}
      disabled={disabled}
      className="gap-1"
    >
      <Star className="size-3" />
      Set as primary
    </Button>
  )
}
