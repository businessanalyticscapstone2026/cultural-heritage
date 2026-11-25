"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, User, Compass, Bookmark, Clock, Settings, Save, Loader2, CheckCircle } from "lucide-react"
import { Reveal } from "@/components/animations/reveal"
import { updateProfileAction } from "../actions"
import PreferencesTab from "./preferences-tab"
import SavedTab from "./saved-tab"
import HistoryTab from "./history-tab"
import AccountTab from "./account-tab"
import type { ProfileData, ProfileCategory, RecommendationHistoryItem, ProfileTab } from "../types"
import type { SavedSite } from "@/types/heritage"

interface ProfileClientProps {
  userId: string
  profile: ProfileData
  categories: ProfileCategory[]
  savedSites: SavedSite[]
  recommendationHistory: RecommendationHistoryItem[]
}

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "history", label: "History", icon: Clock },
  { id: "account", label: "Account", icon: Settings },
]

export default function ProfileClient({
  userId,
  profile,
  categories,
  savedSites,
  recommendationHistory,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile")

  // Profile tab state
  const [firstName, setFirstName] = useState(profile.firstName ?? "")
  const [lastName, setLastName] = useState(profile.lastName ?? "")
  const [homeLatitude, setHomeLatitude] = useState(profile.homeLatitude)
  const [homeLongitude, setHomeLongitude] = useState(profile.homeLongitude)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = [
    (profile.firstName ?? "?").charAt(0).toUpperCase(),
    (profile.lastName ?? "").charAt(0).toUpperCase(),
  ]
    .filter(Boolean)
    .join("")

  const hasProfileChanges =
    firstName !== (profile.firstName ?? "") ||
    lastName !== (profile.lastName ?? "") ||
    homeLatitude !== profile.homeLatitude ||
    homeLongitude !== profile.homeLongitude

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfileAction(userId, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        homeLatitude,
        homeLongitude,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = useCallback(
    async (data: {
      preferredCategoryIds: string[]
      interests: string[]
      travelStyle: string | null
      groupType: string | null
      ageGroup: string | null
      accessibilityNeeds: string[]
    }) => {
      await updateProfileAction(userId, {
        preferredCategoryIds: data.preferredCategoryIds,
        interests: data.interests,
        travelStyle: data.travelStyle,
        groupType: data.groupType,
        ageGroup: data.ageGroup,
        accessibilityNeeds: data.accessibilityNeeds,
      })
    },
    [userId],
  )

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="mx-auto max-w-3xl px-4 pb-12 md:px-6 md:pb-16">
        {/* Back link */}
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to home
        </Link>

        {/* Header */}
        <Reveal className="mb-8">
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
        </Reveal>

        {/* Tabs */}
        <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-ink/10 bg-cream p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-ink text-cream shadow-sm"
                    : "text-ink-soft hover:text-ink hover:bg-parchment/50"
                }`}
              >
                <Icon size={13} strokeWidth={1.5} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-ink/10 bg-cream p-6"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-display text-lg text-ink">Personal Information</h2>
                <p className="mt-1 text-sm text-ink-soft">Update your name and home location.</p>
              </div>

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

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">Email</label>
                <input
                  type="email"
                  value={profile.email ?? ""}
                  disabled
                  className="w-full rounded-xl border border-ink/10 bg-parchment/50 px-3.5 py-2 text-sm text-ink-soft outline-none"
                />
              </div>

              {/* Home Location */}
              <div className="border-t border-ink/10 pt-6">
                <h3 className="text-sm font-semibold text-ink">Home Location</h3>
                {homeLatitude != null && homeLongitude != null ? (
                  <p className="mt-2 text-sm text-ink-soft">
                    {homeLatitude.toFixed(4)}, {homeLongitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-ink-soft">
                    No home location set.{" "}
                    <Link href="/onboarding" className="text-accent underline underline-offset-2 hover:text-accent/80">
                      Set it up in onboarding
                    </Link>
                  </p>
                )}
                <Link
                  href="/onboarding"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
                >
                  Update location →
                </Link>
              </div>

              {/* Save */}
              <div className="flex items-center justify-end gap-3 border-t border-ink/10 pt-6">
                {saved && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle size={12} strokeWidth={1.5} />
                    Saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving || !hasProfileChanges}
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
          )}

          {activeTab === "preferences" && (
            <PreferencesTab
              preferredCategoryIds={profile.preferredCategoryIds}
              interests={profile.interests}
              categories={categories}
              travelStyle={profile.travelStyle}
              groupType={profile.groupType}
              ageGroup={profile.ageGroup}
              accessibilityNeeds={profile.accessibilityNeeds}
              onSave={handleSavePreferences}
              saving={false}
            />
          )}

          {activeTab === "saved" && <SavedTab initialSites={savedSites} />}

          {activeTab === "history" && <HistoryTab items={recommendationHistory} />}

          {activeTab === "account" && <AccountTab email={profile.email} />}
        </motion.div>
      </div>
    </div>
  )
}
