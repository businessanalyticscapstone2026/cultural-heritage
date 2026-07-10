"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Session } from "@/types/user"

type AuthContextValue = {
  session: Session | null
  profile: Session["user"] | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (supabaseSession) {
        setSession({
          user: {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email ?? "",
            fullName: supabaseSession.user.user_metadata?.full_name ?? "",
            createdAt: supabaseSession.user.created_at ?? "",
            updatedAt: supabaseSession.user.updated_at ?? "",
          },
          accessToken: supabaseSession.access_token,
        })
      } else {
        setSession(null)
      }
      setIsLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
      if (supabaseSession) {
        setSession({
          user: {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email ?? "",
            fullName: supabaseSession.user.user_metadata?.full_name ?? "",
            createdAt: supabaseSession.user.created_at ?? "",
            updatedAt: supabaseSession.user.updated_at ?? "",
          },
          accessToken: supabaseSession.access_token,
        })
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      setSession({
        user: {
          id: data.session.user.id,
          email: data.session.user.email ?? "",
          fullName: data.session.user.user_metadata?.full_name ?? "",
          createdAt: data.session.user.created_at ?? "",
          updatedAt: data.session.user.updated_at ?? "",
        },
        accessToken: data.session.access_token,
      })
    } else {
      setSession(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile: session?.user ?? null,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
