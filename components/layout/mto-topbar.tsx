"use client"

import { useEffect, useState } from "react"
import { Bell, MapPin } from "lucide-react"
import { useRole } from "@/context/role-context"
import { getTodayScanCountAction } from "@/features/mto-dashboard/actions/dashboard"
import StaffIdentityMenu from "@/components/layout/staff-identity-menu"

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
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          {scanCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {scanCount > 99 ? "99+" : scanCount}
            </span>
          )}
        </button>
        <StaffIdentityMenu roleLabelFallback="Tourism Officer" />
      </div>
    </header>
  )
}
