"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useRole } from "@/context/role-context"
import type { UserRole } from "@/types/user"

export default function RoleGuard({
  role,
  redirectTo,
  children,
}: {
  role: UserRole
  redirectTo: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const { session } = useAuth()
  const { role: currentRole, isLoading } = useRole()

  useEffect(() => {
    if (isLoading) return
    if (!session || (currentRole !== role && currentRole === null)) {
      router.replace("/login")
      return
    }
    if (currentRole !== role) {
      router.replace(redirectTo)
    }
  }, [isLoading, session, currentRole, role, redirectTo, router])

  if (isLoading || !session || currentRole !== role) return null

  return <>{children}</>
}
