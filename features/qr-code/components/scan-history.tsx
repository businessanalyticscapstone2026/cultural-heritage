"use client"

import { useState } from "react"
import { History, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScanHistoryItem } from "../types"
import { formatDistanceToNow } from "@/lib/format-time"

interface ScanHistoryProps {
  history: ScanHistoryItem[]
  onSelect: (siteId: string) => void
  onClear: () => void
}

export function ScanHistory({ history, onSelect, onClear }: ScanHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (history.length === 0) return null

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <History className="size-4" />
          Recently scanned ({history.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-1 px-4 pb-4">
          {history.map((item, index) => (
            <button
              key={`${item.siteId}-${index}`}
              onClick={() => onSelect(item.siteId)}
              className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-heading">
                  {item.siteName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(item.scannedAt)}
                </p>
              </div>
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={onClear} className="w-full text-xs">
            Clear history
          </Button>
        </div>
      )}
    </div>
  )
}
