"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getRecentScansAction } from "../actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { QrCode } from "lucide-react"
import type { RecentScan } from "@/types/mto-dashboard"
import { formatDistanceToNow } from "@/lib/format-time"

export default function RecentScansList() {
  const [scans, setScans] = useState<RecentScan[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setScans(null)
    getRecentScansAction()
      .then(setScans)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
  }

  useEffect(() => {
    let cancelled = false
    getRecentScansAction()
      .then((result) => {
        if (!cancelled) setScans(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      })
    return () => { cancelled = true }
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent QR Code Scans</CardTitle>
        <Link href="/mto/qr-codes" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive">
            <p>{error}</p>
            <button type="button" onClick={load} className="mt-1 text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        )}
        {!scans && !error && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {scans && scans.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No scans yet</p>
        )}
        {scans && scans.length > 0 && (
          <ul className="space-y-2">
            {scans.map((scan) => (
              <li
                key={scan.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{scan.siteName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {scan.deviceType && (
                    <Badge variant="secondary" className="text-[10px]">
                      {scan.deviceType}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(scan.scannedAt))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
