"use client"

import { EyeOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ANONYMOUS_AUTHOR_LABEL } from "../constants"

interface AnonymousReviewToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function AnonymousReviewToggle({ checked, onCheckedChange }: AnonymousReviewToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
      <div className="flex items-start gap-2">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <label htmlFor="review-anonymous" className="text-sm font-medium text-heading">
            Post anonymously
          </label>
          <p id="review-anonymous-hint" className="text-xs text-muted-foreground">
            Your name and profile are hidden from visitors and tourism staff. The review shows as
            &ldquo;{ANONYMOUS_AUTHOR_LABEL}&rdquo;.
          </p>
        </div>
      </div>
      <Switch
        id="review-anonymous"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value)}
        aria-describedby="review-anonymous-hint"
      />
    </div>
  )
}
