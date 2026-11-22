"use client"

import { MapPin } from "lucide-react"
import NotificationMenu from "@/components/layout/notification-menu"
import StaffIdentityMenu from "@/components/layout/staff-identity-menu"

export default function AdminTopbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        <span>First District of Batangas</span>
      </div>
      <div className="flex items-center gap-3">
        <NotificationMenu items={[]} />
        <StaffIdentityMenu roleLabelFallback="PTCAO Administrator" profileHref="/admin/settings" />
      </div>
    </header>
  )
}
