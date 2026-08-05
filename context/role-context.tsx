"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { UserRole } from "@/types/user"
import { useAuth } from "@/context/auth-context"
import { resolveUserRole } from "@/features/auth/services"
import { createClient } from "@/utils/supabase/client"

type RoleContextValue = {
  role: UserRole | null
  roleName: string | null
  isAdmin: boolean
  isMTO: boolean
  isTourist: boolean
  isLoading: boolean
  municipalityId: string | null
  municipalityName: string | null
  staffName: string | null
}

const RoleContext = createContext<RoleContextValue | null>(null)

function resolveStaffName(
  profile: Record<string, unknown> | null,
  fallback: string | null
): string | null {
  if (profile) {
    const firstName = (profile.first_name as string) ?? ""
    const lastName = (profile.last_name as string) ?? ""
    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    if (fullName) return fullName
    const username = (profile.username as string) ?? ""
    if (username) return username
  }
  return fallback || null
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: authLoading } = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [roleName, setRoleName] = useState<string | null>(null)
  const [municipalityId, setMunicipalityId] = useState<string | null>(null)
  const [municipalityName, setMunicipalityName] = useState<string | null>(null)
  const [staffName, setStaffName] = useState<string | null>(null)
  const sessionUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const userId = session?.user.id ?? null

    // Reset all state whenever the authenticated user changes so a previous
    // session's name/role/municipality never leaks into the new session.
    if (sessionUserIdRef.current !== userId) {
      sessionUserIdRef.current = userId
      setRole(null)
      setRoleName(null)
      setStaffName(null)
      setMunicipalityId(null)
      setMunicipalityName(null)
    }

    if (!session) return

    resolveUserRole(session.user.id).then((result) => {
      // Ignore stale results from a previous session.
      if (sessionUserIdRef.current !== session.user.id) return

      setRole(result.role)
      setRoleName(result.roleName)

      if (result.role === "ptcao_admin" || result.role === "mto") {
        const profile = result.profile as Record<string, unknown> | null
        setStaffName(resolveStaffName(profile, session.user.fullName))

        if (result.role === "mto") {
          const mId = (profile?.municipality_id as string) ?? null
          setMunicipalityId(mId)

          if (mId) {
            const supabase = createClient()
            supabase
              .from("municipalities")
              .select("name")
              .eq("id", mId)
              .maybeSingle()
              .then(({ data }) => {
                if (sessionUserIdRef.current !== session.user.id) return
                setMunicipalityName((data?.name as string) ?? null)
              })
          }
        }
      } else if (result.role === "tourist") {
        const profile = result.profile as Record<string, unknown> | null
        setStaffName(resolveStaffName(profile, session.user.fullName))
      }
    })
  }, [session, authLoading])

  const roleLoading = authLoading || (!!session && role === null) || (!session && role !== null)

  const value: RoleContextValue = {
    role,
    roleName,
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
