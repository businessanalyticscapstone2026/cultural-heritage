"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { UserRole } from "@/types/user"

type RoleContextValue = {
  role: UserRole | null
  isAdmin: boolean
  isMTO: boolean
  isTourist: boolean
  isLoading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const value: RoleContextValue = {
    role: null,
    isAdmin: false,
    isMTO: false,
    isTourist: false,
    isLoading: true,
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error("useRole must be used within RoleProvider")
  return context
}
