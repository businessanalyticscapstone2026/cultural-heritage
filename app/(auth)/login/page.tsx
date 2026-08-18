"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Compass, Route, Star, Heart, X, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { checkLoginRateLimitAction } from "@/features/audit/actions"
import { BrandLogo } from "@/components/brand/brand-logo"

const currentYear = new Date().getFullYear()

const features = [
  {
    icon: Compass,
    title: "Discover heritage",
    description: "Explore rich cultural landmarks across Batangas.",
  },
  {
    icon: Route,
    title: "Plan your trip",
    description: "Get optimized routes and personalized itineraries.",
  },
  {
    icon: Star,
    title: "Smart picks",
    description: "Recommendations tailored to your interests.",
  },
  {
    icon: Heart,
    title: "Save favorites",
    description: "Bookmark sites and build your heritage journey.",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { refreshSession } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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
      try {
        const { allowed } = await checkLoginRateLimitAction(email)
        if (!allowed) {
          setError("Too many failed attempts. Please try again in 15 minutes.")
          return
        }
      } catch {
        // rate limit check is non-critical
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        try {
          await supabase.from("login_attempts").insert({ email_attempted: email, outcome: "failed_password" })
        } catch {}
        setError("Invalid email or password.")
        setPassword("")
        return
      }

      try {
        await supabase.from("login_attempts").insert({
          user_id: data.user.id,
          email_attempted: email,
          outcome: "success",
        })
      } catch {}

      try {
        await supabase.from("tourist_profiles").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)
      } catch {}

      await refreshSession()

      // Resolve role client-side
      const { data: staffProfile } = await supabase
        .from("staff_profiles")
        .select("*, roles(name)")
        .eq("id", data.user.id)
        .maybeSingle()

      if (staffProfile) {
        const roleName = staffProfile.roles?.name
        if (roleName === "MTO Staff") {
          router.push("/mto/dashboard")
        } else {
          router.push("/admin/dashboard")
        }
      } else {
        const { data: touristProfile } = await supabase
          .from("tourist_profiles")
          .select("onboarding_completed_at")
          .eq("id", data.user.id)
          .maybeSingle()

        if (touristProfile) {
          if (touristProfile.onboarding_completed_at) {
            router.push("/home")
          } else {
            router.push("/onboarding")
          }
        } else {
          setError("No profile found for this account. Please contact support.")
          setPassword("")
        }
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
        redirectTo: `${window.location.origin}/login`,
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
    <div className="flex min-h-screen">
      {/* Left Panel — Form (full height, no sub-card) */}
      <div className="flex-1 flex flex-col justify-center bg-white px-8 lg:px-16 py-10">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink">
              <ArrowLeft size={14} strokeWidth={1.5} />
              Back to home
            </Link>
            <BrandLogo variant="light" className="mb-4 size-12" />
            <h1 className="text-3xl font-semibold leading-tight text-[#0B2A4A]">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to explore heritage sites near you</p>
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
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B2A4A] transition-colors"
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
                  className="w-4 h-4 rounded border-gray-300 text-[#1D5FA8] accent-[#1D5FA8] focus:ring-[#1D5FA8]/20"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-sm font-medium text-[#1D5FA8] hover:underline disabled:opacity-50 transition-opacity"
              >
                {isResetting ? "Sending..." : "Forgot password?"}
              </button>
            </div>

            {/* Submit button */}
            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#0B2A4A] hover:bg-[#0B2A4A]/90">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                style={{ color: "#1D5FA8" }}
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Hero / Branding (hidden below 1024px) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/municipalities/taal/Basilica Minore de San Martin de Tours - Taal Batangas.jfif')" }}
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
          {/* Logo badge */}
          <div className="flex items-center gap-3">
            <BrandLogo variant="white" className="size-11" />
            <div className="text-white leading-tight">
              <p className="text-xs uppercase tracking-wide text-white/70">Batangas Heritage</p>
              <p className="font-semibold text-sm">Tourism DSS</p>
            </div>
          </div>

          {/* Welcome heading + subtext */}
          <div className="mt-auto mb-14">
            <h2 className="text-3xl font-semibold text-white mb-3">Discover Batangas</h2>
            <p className="text-white/80 max-w-xs text-sm leading-relaxed">
              Explore heritage sites, plan routes, and get personalized recommendations across the First District.
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
    </div>
  )
}
