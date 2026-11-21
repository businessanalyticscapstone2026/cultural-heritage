"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { LogOut, User, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRole } from "@/context/role-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function StaffIdentityMenu({
  roleLabelFallback,
  profileHref,
}: {
  roleLabelFallback: string
  profileHref?: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { signOut } = useAuth()
  const { staffName, roleName } = useRole()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const roleLabel = roleName || roleLabelFallback

  const handleSignOut = useCallback(async () => {
    setDropdownOpen(false)
    queryClient.clear()
    await signOut()
    window.location.href = "/login"
  }, [signOut, queryClient])

  return (
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
          <p className="text-[10px] leading-tight text-muted-foreground">{roleLabel}</p>
        </div>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-card py-1 shadow-md">
          {profileHref && (
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false)
                router.push(profileHref)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <User className="size-4 text-muted-foreground" />
              Profile
            </button>
          )}
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
  )
}
