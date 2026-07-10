"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Headphones,
  Church,
  MapPin,
  BarChart3,
  Sparkles,
  X,
} from "lucide-react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import LoginSelectorModal from "@/components/auth/login-selector-modal"
import { useAuth } from "@/context/auth-context"
import { mapRoleNameToUserRole } from "@/features/auth/services"

const currentYear = new Date().getFullYear()

const features = [
  {
    icon: MapPin,
    title: "Manage tourism",
    description: "Oversee attractions, events, and tourist resources.",
  },
  {
    icon: BarChart3,
    title: "Data driven decisions",
    description: "Generate reports and analytics for better insights.",
  },
  {
    icon: Sparkles,
    title: "Better services",
    description: "Deliver quality services to tourists and stakeholders.",
  },
]

export default function MTOLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { signOut, refreshSession } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const validateForm = useCallback((): boolean => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return false
    }
    if (!password) {
      setError("Please enter your password.")
      return false
    }
    return true
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResetMessage(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError("Invalid email or password.")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("staff_profiles")
        .select("*, roles(name)")
        .eq("id", data.user.id)
        .maybeSingle()

      if (profileError || !profile) {
        await signOut()
        setError("This account is not authorized for staff access.")
        return
      }

      if (profile.account_status !== "active") {
        await signOut()
        setError("This account is not authorized for staff access.")
        return
      }

      await refreshSession()

      const roleName = profile.roles?.name
      const mappedRole = mapRoleNameToUserRole(roleName)
      if (mappedRole === "ptcao_admin") {
        router.push("/ptcao/dashboard")
      } else {
        router.push("/mto/dashboard")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter your email address above first.")
      return
    }

    setError(null)
    setResetMessage(null)
    setIsResetting(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/mto/dashboard`,
      })

      if (resetError) {
        setError("Unable to send reset email. Please try again.")
      } else {
        setResetMessage("Password reset link sent! Check your email inbox.")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  useEffect(() => {
    if (!resetMessage) return
    const timer = setTimeout(() => setResetMessage(null), 6000)
    return () => clearTimeout(timer)
  }, [resetMessage])

  return (
    <>
      <LoginSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex min-h-screen">
        {/* Left Panel — Hero / Branding (hidden below 1024px) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/municipalities/taal/Heritage Town of Taal.jfif')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, rgba(7,27,48,0.92) 0%, rgba(11,42,74,0.88) 45%, rgba(29,95,168,0.75) 100%)",
            }}
          />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 45%)",
          }} />

          <div className="relative z-10 flex flex-col h-full p-10 text-white">
            {/* Agency seal / logo + label */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/images/logo1.png"
                  alt="Provincial Seal"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="text-white leading-tight">
                <p className="text-xs uppercase tracking-wide text-white/70">Batangas Province</p>
                <p className="font-semibold text-sm">Municipal Tourism Office</p>
              </div>
            </div>

            {/* Welcome heading + subtext */}
            <div className="mt-auto mb-14">
              <h2 className="text-3xl font-semibold text-white mb-3">Welcome back!</h2>
              <p className="text-white/80 max-w-xs text-sm leading-relaxed">
                Sign in to access the MTO dashboard and manage tourism operations efficiently.
              </p>
            </div>

            {/* Feature rows */}
            <div className="space-y-5">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{feature.title}</p>
                    <p className="text-xs text-white/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Copyright bar */}
            <div className="mt-14">
              <p className="text-xs text-white/40">
                &copy; {currentYear} Provincial Tourism and Cultural Affairs Office. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel — Form Card */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-5 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Back to role selection */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to role selection
            </button>

            {/* Icon badge */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-[#EAF2FB] flex items-center justify-center shadow-sm">
                <Church className="w-6 h-6 text-[#1D5FA8]" />
              </div>
            </div>

            {/* Portal heading */}
            <h1 className="text-xl font-semibold text-center text-heading">MTO Portal</h1>
            <p className="text-sm text-center text-muted mt-1 mb-5">
              Municipal Tourism Office Management System
            </p>

            {/* Divider with label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 whitespace-nowrap">Sign in to your account</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3 mb-4"
              >
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 mt-0.5 text-error/60 hover:text-error"
                  aria-label="Dismiss error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Reset-password success message */}
            {resetMessage && (
              <div
                role="status"
                className="flex items-start gap-2 bg-success/10 border border-success/20 text-success text-sm rounded-lg px-4 py-3 mb-4"
              >
                <span className="flex-1">{resetMessage}</span>
                <button
                  type="button"
                  onClick={() => setResetMessage(null)}
                  className="shrink-0 mt-0.5 text-success/60 hover:text-success"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="mto-email" className="block text-sm font-medium text-heading mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="mto-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-white text-heading placeholder:text-muted/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="mto-password" className="block text-sm font-medium text-heading mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="mto-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm bg-white text-heading placeholder:text-muted/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary accent-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-body">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-sm text-secondary hover:underline disabled:opacity-50 transition-opacity"
                >
                  {isResetting ? "Sending..." : "Forgot Password?"}
                </button>
              </div>

              {/* Submit button */}
              <Button type="submit" disabled={isLoading} className="w-full h-10 bg-[#0B2A4A] hover:bg-[#0B2A4A]/90">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted flex items-center justify-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 shrink-0" />
                <span>Need help? Contact your system administrator</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
