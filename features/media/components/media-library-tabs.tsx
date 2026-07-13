"use client"

import type { MediaTabType } from "../types"
import { MEDIA_TABS } from "../constants"
import { cn } from "@/lib/utils"

interface MediaLibraryTabsProps {
  activeTab: MediaTabType
  onTabChange: (tab: MediaTabType) => void
  counts: Record<MediaTabType, number>
}

export default function MediaLibraryTabs({
  activeTab,
  onTabChange,
  counts,
}: MediaLibraryTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Media type filter">
      {MEDIA_TABS.map((tab) => {
        const isActive = activeTab === tab.value
        const count = counts[tab.value] ?? 0
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                isActive ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
