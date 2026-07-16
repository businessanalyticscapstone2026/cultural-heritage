"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin, Tag, Save, Loader2, X, Plus, LogOut, Bookmark } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { updateProfileAction } from "../actions"

interface ProfileData {
  firstName: string | null
  lastName: string | null
  email: string | null
  homeLatitude: number | null
  homeLongitude: number | null
  interests: string[]
  preferredCategoryIds: string[]
  onboarded: boolean
}

interface ProfileClientProps {
  userId: string
  profile: ProfileData
}

export default function ProfileClient({ userId, profile }: ProfileClientProps) {
  const router = useRouter()

  const [firstName, setFirstName] = useState(profile.firstName ?? "")
  const [lastName, setLastName] = useState(profile.lastName ?? "")
  const [homeLatitude, setHomeLatitude] = useState(profile.homeLatitude)
  const [homeLongitude, setHomeLongitude] = useState(profile.homeLongitude)
  const [interests, setInterests] = useState<string[]>(profile.interests)
  const [interestInput, setInterestInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/bookmarks/count")
      .then((r) => r.json())
      .then((d) => setSavedCount(d.count ?? 0))
      .catch(() => setSavedCount(0))
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const initials = [
    (profile.firstName ?? "?").charAt(0).toUpperCase(),
    (profile.lastName ?? "").charAt(0).toUpperCase(),
  ]
    .filter(Boolean)
    .join("")

  const handleAddInterest = useCallback(() => {
    const tag = interestInput.trim().toLowerCase()
    if (tag && !interests.includes(tag)) {
      setInterests((prev) => [...prev, tag])
    }
    setInterestInput("")
  }, [interestInput, interests])

  const handleRemoveInterest = useCallback((tag: string) => {
    setInterests((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleAddInterest()
      }
    },
    [handleAddInterest],
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfileAction(userId, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        homeLatitude,
        homeLongitude,
        interests,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const hasChanges =
    firstName !== (profile.firstName ?? "") ||
    lastName !== (profile.lastName ?? "") ||
    homeLatitude !== profile.homeLatitude ||
    homeLongitude !== profile.homeLongitude ||
    JSON.stringify(interests) !== JSON.stringify(profile.interests)

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="mx-auto max-w-2xl px-4 pt-20 pb-12 md:px-6 md:pt-24 md:pb-16">
        {/* Back + Header */}
        <div className="mb-10">
          <Link
            href="/home"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to home
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 rounded-full bg-ink text-cream text-lg font-semibold">
                <span className="m-auto">{initials || "?"}</span>
              </span>
              <div>
                <h1 className="text-display text-2xl text-ink">
                  {profile.firstName ? `${profile.firstName}'s Profile` : "Your Profile"}
                </h1>
                <p className="text-sm text-ink-soft">{profile.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-parchment hover:text-ink"
            >
              {signingOut ? (
                <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <LogOut size={12} strokeWidth={1.5} />
              )}
              Sign out
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Info */}
          <section className="rounded-2xl border border-ink/10 bg-cream p-6">
            <h2 className="text-display text-lg text-ink mb-4">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-ink/10 bg-background px-3.5 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:ring-3 focus:ring-accent/10"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-ink/10 bg-background px-3.5 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:ring-3 focus:ring-accent/10"
                  placeholder="Your last name"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Email</label>
              <input
                type="email"
                value={profile.email ?? ""}
                disabled
                className="w-full rounded-xl border border-ink/10 bg-parchment/50 px-3.5 py-2 text-sm text-ink-soft outline-none"
              />
            </div>
          </section>

          {/* Home Location */}
          <section className="rounded-2xl border border-ink/10 bg-cream p-6">
            <h2 className="text-display text-lg text-ink mb-4">Home Location</h2>
            {homeLatitude != null && homeLongitude != null ? (
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <MapPin size={14} strokeWidth={1.5} className="shrink-0 text-accent" />
                <span>
                  {homeLatitude.toFixed(4)}, {homeLongitude.toFixed(4)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">
                No home location set.{" "}
                <Link href="/onboarding" className="text-accent underline underline-offset-2 hover:text-accent/80">
                  Set it up in onboarding
                </Link>
              </p>
            )}
            <Link
              href="/onboarding"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
            >
              Update location
              <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
          </section>

          {/* Interests */}
          <section className="rounded-2xl border border-ink/10 bg-cream p-6">
            <h2 className="text-display text-lg text-ink mb-4">Interests</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. history buff, photography..."
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-ink/10 bg-background px-3.5 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:ring-3 focus:ring-accent/10"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                disabled={!interestInput.trim()}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-ink/10 bg-cream text-ink-soft transition-colors hover:bg-parchment hover:text-ink disabled:opacity-40"
              >
                <Plus size={16} strokeWidth={1.5} />
              </button>
            </div>
            {interests.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                  >
                    <Tag size={10} strokeWidth={1.5} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(tag)}
                      className="hover:text-accent/80 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X size={12} strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-ink-soft/60">
                Add tags that describe your travel interests.
              </p>
            )}
          </section>

          {/* Saved Sites */}
          <section className="rounded-2xl border border-ink/10 bg-cream p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                  <Bookmark size={16} strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="text-display text-lg text-ink">Saved Sites</h2>
                  <p className="text-xs text-ink-soft">
                    {savedCount === null
                      ? "Loading..."
                      : savedCount === 0
                        ? "No saved sites yet"
                        : `${savedCount} site${savedCount === 1 ? "" : "s"} saved`}
                  </p>
                </div>
              </div>
              <Link
                href="/saved"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-parchment hover:text-ink"
              >
                View all
                <ArrowRight size={12} strokeWidth={1.5} />
              </Link>
            </div>
          </section>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-xs font-medium text-success">Profile saved</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-all hover:bg-ink/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <Save size={14} strokeWidth={1.5} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
