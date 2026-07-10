"use client"

import { Bell, User, LogOut } from "lucide-react"

export default function AdminTopbar() {
  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-6">
      <button type="button" aria-label="Notifications" className="text-muted-foreground hover:text-foreground">
        <Bell className="size-5" />
      </button>
      <button type="button" aria-label="Profile" className="text-muted-foreground hover:text-foreground">
        <User className="size-5" />
      </button>
      <button type="button" aria-label="Sign out" className="text-muted-foreground hover:text-foreground">
        <LogOut className="size-5" />
      </button>
    </header>
  )
}
