"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, MapPin, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRole } from "@/context/role-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTodayScanCountAction } from "@/features/mto-dashboard/actions/dashboard"

export default function MTOTopbar() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { staffName, municipalityName } = useRole()
  const [scanCount, setScanCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    getTodayScanCountAction()
      .then((count) => {
        if (!cancelled) setScanCount(count)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  const initials = staffName
    ? staffName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  const handleSignOut = useCallback(async () => {
    setDropdownOpen(false)
    await signOut()
    router.push("/login")
  }, [signOut, router])

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

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight">{staffName}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">Tourism Officer</p>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-card py-1 shadow-md">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <LogOut className="size-4 text-muted-foreground" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
