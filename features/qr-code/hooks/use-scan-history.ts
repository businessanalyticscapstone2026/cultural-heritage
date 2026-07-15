"use client"

import { useState, useCallback, useEffect } from "react"
import type { ScanHistoryItem } from "../types"

const STORAGE_KEY = "heritage-qr-scan-history"
const MAX_ITEMS = 20
const EXPIRY_MS = 24 * 60 * 60 * 1000

function loadHistory(): ScanHistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<ScanHistoryItem, "scannedAt"> & { scannedAt: string }>
    const now = Date.now()
    return parsed
      .map((item) => ({
        ...item,
        scannedAt: new Date(item.scannedAt),
      }))
      .filter((item) => now - item.scannedAt.getTime() < EXPIRY_MS)
  } catch {
    return []
  }
}

function saveHistory(items: ScanHistoryItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
}

interface UseScanHistoryReturn {
  history: ScanHistoryItem[]
  addScan: (item: Omit<ScanHistoryItem, "scannedAt">) => void
  clearHistory: () => void
}

export function useScanHistory(): UseScanHistoryReturn {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setHistory(loadHistory())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      saveHistory(history)
    }
  }, [history, loaded])

  const addScan = useCallback((item: Omit<ScanHistoryItem, "scannedAt">) => {
    setHistory((prev) => {
      const newScan: ScanHistoryItem = {
        ...item,
        scannedAt: new Date(),
      }
      return [newScan, ...prev].slice(0, MAX_ITEMS)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return { history, addScan, clearHistory }
}
