"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserRole } from "@/types/user"
import { useAuth } from "@/context/auth-context"
import { resolveUserRole } from "@/features/auth/services"
import { createClient } from "@/utils/supabase/client"

type RoleContextValue = {
  role: UserRole | null
  isAdmin: boolean
  isMTO: boolean
  isTourist: boolean
  isLoading: boolean
  municipalityId: string | null
  municipalityName: string | null
  staffName: string | null
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: authLoading } = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [municipalityId, setMunicipalityId] = useState<string | null>(null)
  const [municipalityName, setMunicipalityName] = useState<string | null>(null)
  const [staffName, setStaffName] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (session) {
      resolveUserRole(session.user.id).then((result) => {
        setRole(result.role)
        if (result.role === "mto" && result.profile) {
          const profile = result.profile as Record<string, unknown>
          const mId = (profile.municipality_id as string) ?? null
          setMunicipalityId(mId)
          const firstName = (profile.first_name as string) ?? ""
          const lastName = (profile.last_name as string) ?? ""
          const name = [firstName, lastName].filter(Boolean).join(" ")
          setStaffName(name || null)

          if (mId) {
            const supabase = createClient()
            supabase
              .from("municipalities")
              .select("name")
              .eq("id", mId)
              .maybeSingle()
              .then(({ data }) => {
                setMunicipalityName((data?.name as string) ?? null)
              })
          }
        }
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
    municipalityId,
    municipalityName,
    staffName,
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error("useRole must be used within RoleProvider")
  return context
}
