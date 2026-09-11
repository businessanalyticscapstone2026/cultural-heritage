"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Eye, EyeOff, Mail, Lock, User, Compass, Route, Star, Heart, X, ArrowLeft } from "lucide-react"
import { useSignUp } from "@clerk/nextjs/legacy"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"
import { EASE } from "@/lib/motion-variants"

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

export default function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const prefersReducedMotion = useReducedMotion()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason")
    if (reason === "oauth-error") {
      setError("Unable to sign up with Google. Please try again.")
    }
  }, [])

  const handleGoogleSignUp = async () => {
    if (!signUpLoaded) return

    setError(null)
    setIsGoogleLoading(true)

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth/clerk-bridge-register",
      })
    } catch (err) {
      console.error("Google sign-up failed:", err)
      setError("Unable to sign up with Google. Please try again.")
      setIsGoogleLoading(false)
    }
  }
  const validateForm = useCallback((): boolean => {
    if (!firstName.trim()) {
      setError("Please enter your first name.")
      return false
    }
    if (!lastName.trim()) {
      setError("Please enter your last name.")
      return false
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return false
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return false
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.")
      return false
    }
    return true
  }, [firstName, lastName, email, password, confirmPassword, agreeTerms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          },
        },
      })

      if (signUpError) {
        setError(`Sign up failed: ${signUpError.message}`)
        return
      }

      if (data?.user) {
        const { error: profileError } = await supabase.from("tourist_profiles").insert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })

        if (profileError) {
          setError(profileError.message)
          return
        }
      }

      router.push("/onboarding")
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
        {/* Left Panel — Hero / Branding (hidden below 1024px) */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: -24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden"
        >
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
            <div className="flex items-center gap-3">
              <BrandLogo variant="white" className="size-11" />
              <div className="text-white leading-tight">
                <p className="text-xs uppercase tracking-wide text-white/70">Batangas Heritage</p>
                <p className="font-semibold text-sm">Tourism DSS</p>
              </div>
            </div>

            <div className="mt-auto mb-14">
              <h2 className="text-3xl font-semibold text-white mb-3">Start your journey</h2>
              <p className="text-white/80 max-w-xs text-sm leading-relaxed">
                Create an account to explore heritage sites, plan routes, and get personalized recommendations.
              </p>
            </div>

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

            <div className="mt-14">
              <p className="text-xs text-white/40">
                &copy; {currentYear} Provincial Tourism and Cultural Affairs Office. All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Panel — Form (full height, no sub-card) */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: 24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="flex-1 flex flex-col justify-center bg-white px-8 lg:px-16 py-10"
        >
          <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            {/* Logo */}
            <div className="mb-8">
              <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink">
                <ArrowLeft size={14} strokeWidth={1.5} />
                Back to home
              </Link>
              <div className="w-12 h-12 rounded-full bg-[#EAF2FB] flex items-center justify-center mb-4">
                <User className="w-5 h-5 text-[#1D5FA8]" />
              </div>
              <h1 className="text-2xl font-semibold text-[#0B2A4A]">Create your account</h1>
              <p className="text-sm text-gray-500 mt-1">Start discovering Batangas heritage sites</p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* First name + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="first-name"
                      type="text"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                    Last name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="last-name"
                      type="text"
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                    autoComplete="new-password"
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

              {/* Confirm password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-[#0B2A4A] mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B2A4A] transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1D5FA8] accent-[#1D5FA8] focus:ring-[#1D5FA8]/20 shrink-0"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <button type="button" className="text-[#1D5FA8] hover:underline">Terms of Service</button>{" "}
                  and{" "}
                  <button type="button" className="text-[#1D5FA8] hover:underline">Privacy Policy</button>
                </span>
              </label>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#0B2A4A] hover:bg-[#0B2A4A]/90 mt-2"
              >
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create account
                  </span>
                )}
              </Button>
            </form>

            {/* Clerk bot-protection mount point for the custom Google OAuth flow */}
            <div id="clerk-captcha" />

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google sign-up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading || !signUpLoaded}
              className="w-full h-10 mt-6"
            >
              {isGoogleLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing up...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.86-2.98c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.26 21.3 7.31 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.27 14.28A7.14 7.14 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.28A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.28 5.37l3.99-3.09Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.63l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
                  </svg>
                  Sign up with Google
                </span>
              )}
            </Button>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                  style={{ color: "#1D5FA8" }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
    </div>
  )
}
