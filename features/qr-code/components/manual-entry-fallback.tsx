"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ManualEntryFallbackProps {
  onSubmit: (code: string) => void
  isResolving: boolean
}

export function ManualEntryFallback({ onSubmit, isResolving }: ManualEntryFallbackProps) {
  const [code, setCode] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed && !isResolving) {
      onSubmit(trimmed)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="font-heading text-xl font-semibold text-heading">
            Enter code manually
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Type the code from the heritage site marker below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. TCDSS-ABC123"
              disabled={isResolving}
              className="h-12 w-full rounded-lg border border-border bg-input px-4 text-base font-mono uppercase placeholder:text-muted-foreground placeholder:font-safari disabled:opacity-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!code.trim() || isResolving}
            className="h-12 w-full gap-2"
          >
            {isResolving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                Find site
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
