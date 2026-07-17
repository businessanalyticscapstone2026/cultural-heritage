"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, LogOut, Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface AccountTabProps {
  email: string | null
}

export default function AccountTab({ email }: AccountTabProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }

    setChangingPassword(true)
    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email ?? "",
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError("Current password is incorrect.")
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message)
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError("Something went wrong. Please try again.")
    } finally {
      setChangingPassword(false)
    }
  }

  const passwordValid = newPassword.length >= 6 && newPassword === confirmPassword && currentPassword.length > 0

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <section>
        <h3 className="flex items-center gap-2 text-display text-lg text-ink">
          <Settings size={18} strokeWidth={1.5} className="text-accent" />
          Account Settings
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Manage your account credentials and security.
        </p>

        <div className="mt-4 rounded-xl border border-ink/10 bg-parchment/30 px-4 py-3">
          <p className="text-xs font-medium text-ink-soft">Email</p>
          <p className="mt-0.5 text-sm text-ink">{email ?? "Not set"}</p>
        </div>
      </section>

      {/* Change Password */}
      <section>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Lock size={14} strokeWidth={1.5} className="text-ink-soft" />
          Change Password
        </h4>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-background px-3.5 py-2 pr-10 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:ring-3 focus:ring-accent/10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              >
                {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-background px-3.5 py-2 pr-10 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:ring-3 focus:ring-accent/10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-background px-3.5 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:ring-3 focus:ring-accent/10"
              placeholder="Re-enter new password"
            />
          </div>

          {passwordError && (
            <p className="text-xs text-destructive">{passwordError}</p>
          )}

          {passwordSuccess && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle size={12} strokeWidth={1.5} />
              Password updated successfully
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPassword || !passwordValid}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-all hover:bg-ink/90 disabled:opacity-50"
            >
              {changingPassword ? (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <Lock size={14} strokeWidth={1.5} />
              )}
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* Sign Out */}
      <section className="border-t border-ink/10 pt-8">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-parchment hover:text-ink"
        >
          {signingOut ? (
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <LogOut size={14} strokeWidth={1.5} />
          )}
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </section>
    </div>
  )
}
