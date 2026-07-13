"use client"

import { useState, useCallback } from "react"
import type { ScanHistoryItem } from "../types"

interface UseScanHistoryReturn {
  history: ScanHistoryItem[]
  addScan: (item: Omit<ScanHistoryItem, "scannedAt">) => void
  clearHistory: () => void
}

export function useScanHistory(): UseScanHistoryReturn {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  const addScan = useCallback((item: Omit<ScanHistoryItem, "scannedAt">) => {
    setHistory((prev) => {
      const newScan: ScanHistoryItem = {
        ...item,
        scannedAt: new Date(),
      }
      return [newScan, ...prev].slice(0, 20)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return { history, addScan, clearHistory }
}
