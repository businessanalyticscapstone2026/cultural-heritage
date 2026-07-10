"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserRole } from "@/types/user"
import { useAuth } from "@/context/auth-context"
import { resolveUserRole } from "@/features/auth/services"

type RoleContextValue = {
  role: UserRole | null
  isAdmin: boolean
  isMTO: boolean
  isTourist: boolean
  isLoading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: authLoading } = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (session) {
      resolveUserRole(session.user.id).then((result) => {
        setRole(result.role)
      })
    }
  }, [session, authLoading])

  const roleLoading = authLoading || (!!session && role === null) || (!session && role !== null)

  const value: RoleContextValue = {
    role,
    isAdmin: role === "ptcao_admin",
    isMTO: role === "mto",
    isTourist: role === "tourist",
    isLoading: roleLoading,
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error("useRole must be used within RoleProvider")
  return context
}
