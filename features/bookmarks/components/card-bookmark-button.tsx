"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { motion } from "motion/react"
import { useAuth } from "@/context/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { toggleBookmarkAction } from "@/features/heritage/actions/bookmark"

interface CardBookmarkButtonProps {
  siteId: string
  initialIsBookmarked?: boolean
}

export function CardBookmarkButton({
  siteId,
  initialIsBookmarked = false,
}: CardBookmarkButtonProps) {
  const { session } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    const prev = isBookmarked
    setIsBookmarked(!prev)

    try {
      const result = await toggleBookmarkAction(siteId)
      setIsBookmarked(result.isBookmarked)
    } catch {
      setIsBookmarked(prev)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
        isBookmarked
          ? "bg-primary text-white"
          : "bg-black/30 text-white hover:bg-black/50"
      }`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <motion.div
        key={isBookmarked ? "filled" : "empty"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
      </motion.div>
    </button>
  )
}
