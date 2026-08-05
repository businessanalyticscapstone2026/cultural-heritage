"use client"

import { Bell, MapPin } from "lucide-react"
import StaffIdentityMenu from "@/components/layout/staff-identity-menu"

export default function AdminTopbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        <span>First District of Batangas</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
        </button>
        <StaffIdentityMenu roleLabelFallback="PTCAO Administrator" profileHref="/admin/settings" />
      </div>
    </header>
  )
}
