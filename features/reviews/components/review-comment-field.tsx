"use client"

import type { ComponentProps } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MAX_COMMENT_LENGTH } from "../constants"

interface ReviewCommentFieldProps extends Omit<ComponentProps<typeof Textarea>, "id"> {
  id: string
  length: number
  error?: string
}

/** Comment textarea with a live character counter (register() props spread in). */
export function ReviewCommentField({ id, length, error, ...textareaProps }: ReviewCommentFieldProps) {
  const counterId = `${id}-counter`
  const errorId = `${id}-error`
  const nearLimit = length >= MAX_COMMENT_LENGTH * 0.9

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        Your review <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>
      <Textarea
        id={id}
        rows={4}
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="What stood out? Share tips for other visitors."
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(counterId, error && errorId)}
        className="min-h-24 resize-y"
        {...textareaProps}
      />
      <div className="flex items-start justify-between gap-2">
        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          <span />
        )}
        <span
          id={counterId}
          className={cn("shrink-0 text-xs tabular-nums", nearLimit ? "text-warning" : "text-muted-foreground")}
          aria-live={nearLimit ? "polite" : "off"}
        >
          {length}/{MAX_COMMENT_LENGTH}
        </span>
      </div>
    </div>
  )
}
