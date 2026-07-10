"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Session, Profile } from "@/types/user"

type AuthContextValue = {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const value: AuthContextValue = {
    session,
    profile: session?.user ?? null,
    isLoading,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    refreshSession: async () => {},
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
