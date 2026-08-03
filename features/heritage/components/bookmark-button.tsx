"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import AuthPromptModal from "@/components/auth/auth-prompt-modal"
import { toggleBookmarkAction } from "../actions/bookmark"

interface BookmarkButtonProps {
  siteId: string
  initialIsBookmarked?: boolean
  size?: "sm" | "md"
}

export function BookmarkButton({
  siteId,
  initialIsBookmarked = false,
  size = "md",
}: BookmarkButtonProps) {
  const { session } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const handleClick = async () => {
    if (!session) {
      setShowAuthPrompt(true)
      return
    }

    try {
      const result = await toggleBookmarkAction(siteId)
      setIsBookmarked(result.isBookmarked)
    } catch {
      // Revert on error — optimistic update already happened in state
    }
  }

  const sizeClasses = size === "sm"
    ? "h-8 w-8 rounded-full"
    : "h-9 w-9 rounded-full"

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex ${sizeClasses} items-center justify-center border transition-colors ${
          isBookmarked
            ? "border-primary bg-primary text-white"
            : "border-border bg-card text-heading hover:bg-muted"
        }`}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <Bookmark
          className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}
          fill={isBookmarked ? "currentColor" : "none"}
        />
      </button>
      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Save your favorite heritage sites"
        description="Create a free account to bookmark heritage sites and build your personal collection."
      />
    </>
  )
}
