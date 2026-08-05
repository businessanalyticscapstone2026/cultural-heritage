"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

type RoleResolution = {
  userId: string
  role: UserRole | null
  roleName: string | null
  staffName: string | null
  municipalityId: string | null
  municipalityName: string | null
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: authLoading } = useAuth()
  const [resolution, setResolution] = useState<RoleResolution | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!session) return

    let cancelled = false

    resolveUserRole(session.user.id)
      .then(async (result) => {
        if (cancelled) return

        const profile = result.profile as Record<string, unknown> | null
        const next: RoleResolution = {
          userId: session.user.id,
          role: result.role,
          roleName: result.roleName,
          staffName: null,
          municipalityId: null,
          municipalityName: null,
        }

        if (result.role === "ptcao_admin" || result.role === "mto") {
          next.staffName = resolveStaffName(profile, session.user.fullName)

          if (result.role === "mto") {
            const mId = (profile?.municipality_id as string) ?? null
            next.municipalityId = mId

            if (mId) {
              const supabase = createClient()
              const { data } = await supabase
                .from("municipalities")
                .select("name")
                .eq("id", mId)
                .maybeSingle()
              if (!cancelled) next.municipalityName = (data?.name as string) ?? null
            }
          }
        } else if (result.role === "tourist") {
          next.staffName = resolveStaffName(profile, session.user.fullName)
        }

        if (!cancelled) setResolution(next)
      })
      .catch(() => {
        // Never hang on a failed role lookup — mark resolution complete so
        // guards can redirect instead of leaving a blank screen.
        if (!cancelled) {
          setResolution({
            userId: session.user.id,
            role: null,
            roleName: null,
            staffName: null,
            municipalityId: null,
            municipalityName: null,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [session, authLoading])

  const userId = session?.user.id ?? null
  const resolvedForSession =
    resolution !== null && userId !== null && resolution.userId === userId
  const current = resolvedForSession ? resolution : null

  const role = current?.role ?? null
  const roleName = current?.roleName ?? null
  const staffName = current?.staffName ?? null
  const municipalityId = current?.municipalityId ?? null
  const municipalityName = current?.municipalityName ?? null
  const roleLoading = authLoading || (userId !== null && !resolvedForSession)

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
