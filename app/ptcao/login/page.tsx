"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Church,
  Landmark,
  Sparkles,
  BarChart3,
  MapPin,
  X,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import LoginSelectorModal from "@/components/auth/login-selector-modal"
import { useAuth } from "@/context/auth-context"
import { mapRoleNameToUserRole } from "@/features/auth/services"

const currentYear = new Date().getFullYear()

const features = [
  { icon: Landmark, label: "Cultural heritage" },
  { icon: MapPin, label: "GIS mapping" },
  { icon: Sparkles, label: "Smart recommendations" },
  { icon: BarChart3, label: "Data-driven decisions" },
]

export default function PTCAOLoginPage() {
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
        setError("Invalid email or password.")
        return
      }

      const roleName = profile.roles?.name
      const mappedRole = mapRoleNameToUserRole(roleName)

      if (mappedRole === "mto") {
        await signOut()
        setError("Invalid email or password.")
        return
      }

      if (profile.account_status !== "active") {
        await signOut()
        setError("This account is inactive. Contact another administrator.")
        return
      }

      await refreshSession()
      router.push("/admin/dashboard")
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
        redirectTo: `${window.location.origin}/ptcao/dashboard`,
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

      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-5 py-8"
        style={{
          background: "linear-gradient(160deg, #071B30 0%, #0B2A4A 55%, #1D5FA8 100%)",
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/images/municipalities/nasugbu/Caleruega Church, Nasugbu Batangas PH.jfif')" }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8">
            {/* Back to role selection */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to role selection
            </button>

            {/* Logo + label */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0B2A4A] flex items-center justify-center mb-3">
                <Church className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Tourism Cultural</p>
              <h1 className="text-lg font-semibold text-heading">Welcome back</h1>
              <p className="text-sm text-muted mt-1">
                Sign in to continue to your administrator account
              </p>
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
                <label htmlFor="ptcao-email" className="block text-sm font-medium text-heading mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="ptcao-email"
                    type="email"
                    placeholder="Enter your email"
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
                <label htmlFor="ptcao-password" className="block text-sm font-medium text-heading mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="ptcao-password"
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
          </div>

          {/* Feature icons row */}
          <div className="flex gap-6 mt-8 justify-center">
            {features.map((feature) => (
              <div key={feature.label} className="flex flex-col items-center gap-1.5 text-white/70">
                <feature.icon className="w-4 h-4" />
                <span className="text-[11px]">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/40">
              &copy; {currentYear} Tourism Cultural DSS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
