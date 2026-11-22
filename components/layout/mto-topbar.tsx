"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { useRole } from "@/context/role-context"
import { getTodayScanCountAction } from "@/features/mto-dashboard/actions/dashboard"
import StaffIdentityMenu from "@/components/layout/staff-identity-menu"
import NotificationMenu, { type NotificationItem } from "@/components/layout/notification-menu"

export default function MTOTopbar() {
  const { municipalityName } = useRole()
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    getTodayScanCountAction()
      .then((count) => {
        if (!cancelled) setScanCount(count)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const notifications: NotificationItem[] =
    scanCount > 0
      ? [
          {
            id: "today-scans",
            title: `${scanCount} QR ${scanCount === 1 ? "scan" : "scans"} today`,
            description: "Visitors scanned heritage site QR codes in your municipality.",
            href: "/mto/qr-codes",
          },
        ]
      : []

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {municipalityName && (
          <>
            <MapPin className="size-4" />
            <span>{municipalityName}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationMenu items={notifications} />
        <StaffIdentityMenu roleLabelFallback="Tourism Officer" />
      </div>
    </header>
  )
}
