"use client"

import { useState, useCallback, useEffect, useRef, Suspense } from "react"
import type { ReactNode, Ref } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { EASE } from "@/lib/motion-variants"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Compass,
  Route,
  Star,
  Heart,
  X,
  ArrowLeft,
  AlertCircle,
  Info,
  MailCheck,
} from "lucide-react"
import { useSignIn } from "@clerk/nextjs/legacy"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { checkLoginRateLimitAction } from "@/features/audit/actions"
import { BrandLogo } from "@/components/brand/brand-logo"
import { cn } from "@/lib/utils"
import { resolvePostLoginRoute, isPathAuthorizedForRole } from "@/lib/auth/resolve-post-login-route"

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

interface LoginFieldProps {
  id: string
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  icon: ReactNode
  trailing?: ReactNode
  error?: string
  disabled?: boolean
  autoComplete: string
  inputRef?: Ref<HTMLInputElement>
}

function LoginField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  icon,
  trailing,
  error,
  disabled,
  autoComplete,
  inputRef,
}: LoginFieldProps) {
  const filled = value !== ""

  const iconClasses = disabled
    ? "text-gray-400"
    : error
      ? "text-error group-focus-within:text-error"
      : filled
        ? "text-gray-500 group-hover:text-gray-500 group-focus-within:text-[#1D5FA8]"
        : "text-gray-400 group-hover:text-gray-500 group-focus-within:text-[#1D5FA8]"

  const inputClasses = cn(
    "h-11 w-full rounded-lg border bg-white pl-10 text-sm text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors duration-150 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden",
    "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:placeholder:text-gray-300 disabled:hover:border-gray-200",
    trailing ? "pr-10" : "pr-4",
    disabled
      ? ""
      : error
        ? "border-error hover:border-error focus:border-error focus:ring-2 focus:ring-error/15"
        : filled
          ? "border-gray-400 hover:border-gray-400 focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
          : "border-gray-300 hover:border-gray-400 focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15",
  )

  return (
    <div className="group">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#0B2A4A]">
        {label}
      </label>
      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150",
            iconClasses,
          )}
        >
          {icon}
        </span>
        <input
          id={id}
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClasses}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-error">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function LoginRedirectFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <svg className="animate-spin w-6 h-6 text-[#0B2A4A]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginRedirectFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const supabase = createClient()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { session, isLoading: authLoading, refreshSession } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const reasonParam = searchParams.get("reason")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [sessionChecked, setSessionChecked] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const fieldsDisabled = isLoading || isResetting

  // Already-authenticated state: bounce off /login to the user's role-based
  // destination (or an authorized ?redirect= target) before the form renders.
  useEffect(() => {
    if (authLoading || !session) return

    let cancelled = false

    void (async () => {
      const resolved = await resolvePostLoginRoute(supabase, session.user.id)
      if (cancelled) return

      if (!resolved) {
        setError("No profile found for this account. Please contact support.")
        setSessionChecked(true)
        return
      }

      const target =
        redirectParam && isPathAuthorizedForRole(redirectParam, resolved.role)
          ? redirectParam
          : resolved.defaultRoute

      router.replace(target)
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, session, supabase, redirectParam, router])

  const validateField = useCallback(
    (name: string, value: string): string | undefined => {
      if (name === "email") {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address."
        }
      }
      if (name === "password") {
        if (!value) return "Please enter your password."
      }
      return undefined
    },
    [],
  )

  const validateForm = useCallback((): boolean => {
    const next: { email?: string; password?: string } = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Please enter a valid email address."
    }
    if (!password) {
      next.password = "Please enter your password."
    }
    setFieldErrors(next)
    if (next.email) {
      emailRef.current?.focus()
      return false
    }
    if (next.password) {
      passwordRef.current?.focus()
      return false
    }
    return true
  }, [email, password])

  if (authLoading || (session && !sessionChecked)) {
    return <LoginRedirectFallback />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

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

      const resolved = await resolvePostLoginRoute(supabase, data.user.id)

      if (!resolved) {
        setError("No profile found for this account. Please contact support.")
        setPassword("")
        return
      }

      const target =
        redirectParam && isPathAuthorizedForRole(redirectParam, resolved.role)
          ? redirectParam
          : resolved.defaultRoute

      router.push(target)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!signInLoaded) return

    setError(null)
    setIsGoogleLoading(true)

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth/clerk-bridge-register",
      })
    } catch {
      setError("Unable to sign in with Google. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: "Please enter your email address above first." })
      emailRef.current?.focus()
      return
    }

    setError(null)
    setFieldErrors({})
    setIsResetting(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (resetError) {
        setResetEmailSent(false)
        setError("Unable to send reset email. Please try again.")
      } else {
        setResetEmailSent(true)
      }
    } catch {
      setResetEmailSent(false)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Form (full height, no sub-card) */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: -24 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex-1 flex flex-col justify-center bg-white px-8 lg:px-16 py-10"
      >
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-all duration-150 hover:text-ink hover:-translate-x-0.5 active:scale-[0.98] active:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D5FA8]/50 focus-visible:rounded">
              <ArrowLeft size={14} strokeWidth={1.5} />
              Back to home
            </Link>
            <BrandLogo variant="light" className="mb-4 size-12" />
            <h1 className="text-3xl font-semibold leading-tight text-[#0B2A4A]">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-2">
              {redirectParam && reasonParam !== "expired"
                ? "Sign in to continue"
                : "Sign in to explore heritage sites near you"}
            </p>
          </div>

          {resetEmailSent ? (
            /* Password reset confirmation */
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-5">
                <MailCheck className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-[#0B2A4A]">Check your email</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                We sent a password reset link to <span className="font-medium text-[#0B2A4A]">{email}</span>. Follow
                the link in that email to choose a new password.
              </p>

              <Button
                type="button"
                onClick={() => setResetEmailSent(false)}
                className="w-full h-11 mt-6 bg-[#0B2A4A] hover:bg-[#0B2A4A]/90"
              >
                Back to sign in
              </Button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="mt-4 w-full text-center text-sm text-gray-500 hover:text-[#1D5FA8] disabled:opacity-50 transition-colors"
              >
                {isResetting ? "Resending..." : "Didn't get it? Resend"}
              </button>
            </motion.div>
          ) : (
            <>
              {/* Error / session-expired banner */}
              {(error || reasonParam === "expired" || reasonParam === "no-profile" || reasonParam === "oauth-error") && (
                <motion.div
                  role="alert"
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-start gap-2 text-sm rounded-lg px-4 py-3 mb-4",
                    error || reasonParam === "no-profile" || reasonParam === "oauth-error"
                      ? "bg-error/10 border border-error/20 text-error"
                      : "bg-warning/5 border border-warning/30 text-warning",
                  )}
                >
                  {error || reasonParam === "no-profile" || reasonParam === "oauth-error" ? (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1">
                    {error ??
                      (reasonParam === "no-profile"
                        ? "No profile found for this account. Please contact support."
                        : reasonParam === "oauth-error"
                          ? "Unable to sign in with Google. Please try again."
                          : "Your session has expired. Please sign in again.")}
                  </span>
                  {error && (
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="shrink-0 mt-0.5 text-error/60 hover:text-error"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email */}
                <LoginField
                  id="login-email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(value) => {
                    setEmail(value)
                    setFieldErrors((prev) => ({ ...prev, email: validateField("email", value) }))
                  }}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, email: validateField("email", email) }))}
                  icon={<Mail className="h-4 w-4" />}
                  error={fieldErrors.email}
                  disabled={fieldsDisabled}
                  autoComplete="email"
                  inputRef={emailRef}
                />

                {/* Password */}
                <LoginField
                  id="login-password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(value) => {
                    setPassword(value)
                    setFieldErrors((prev) => ({ ...prev, password: validateField("password", value) }))
                  }}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, password: validateField("password", password) }))}
                  icon={<Lock className="h-4 w-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={fieldsDisabled}
                      className="text-gray-400 transition-colors hover:text-[#0B2A4A] group-focus-within:text-[#1D5FA8] disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={fieldErrors.password}
                  disabled={fieldsDisabled}
                  autoComplete="current-password"
                  inputRef={passwordRef}
                />

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
                <Button type="submit" disabled={fieldsDisabled} className="w-full h-11 bg-[#0B2A4A] hover:bg-[#0B2A4A]/90">
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

              {/* Divider */}
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Google sign-in */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={fieldsDisabled || isGoogleLoading || !signInLoaded}
                className="w-full h-11 mt-6"
              >
                {isGoogleLoading ? (
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
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.86-2.98c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.28A7.14 7.14 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.28A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.28 5.37l3.99-3.09Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.63l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
                      />
                    </svg>
                    Sign in with Google
                  </span>
                )}
              </Button>

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
            </>
          )}
        </div>
      </motion.div>

      {/* Right Panel — Hero / Branding (hidden below 1024px) */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 24 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: prefersReducedMotion ? 0 : 0.1 }}
        className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/municipalities/nasugbu/4785b65682e4b3288f998b0a15054ae7.jpg')" }}
          aria-hidden="true"
        />
        {/* Light base tint — keeps the photo visible across the whole panel */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, rgba(7,27,48,0.5) 0%, rgba(11,42,74,0.42) 50%, rgba(29,95,168,0.35) 100%)",
          }}
        />
        {/* Concentrated dark gradient anchored bottom-left, behind the text block */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(3,12,24,0.92) 0%, rgba(5,20,38,0.7) 35%, rgba(7,27,48,0.25) 60%, transparent 78%), radial-gradient(ellipse 90% 70% at 10% 100%, rgba(3,12,24,0.85), transparent 70%)",
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
          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{feature.title}</p>
                  <p className="text-xs text-white/70 leading-relaxed">{feature.description}</p>
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
      </motion.div>
    </div>
  )
}
