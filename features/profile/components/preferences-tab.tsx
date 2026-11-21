"use client"

import { useState, useCallback } from "react"
import { Compass, Tag, X, Plus, Check, Users, Accessibility, Navigation } from "lucide-react"
import { TRAVEL_STYLES, GROUP_TYPES, ACCESSIBILITY_NEEDS } from "@/lib/constants"
import { formatCategoryName } from "@/lib/format-category"
import type { ProfileCategory } from "../types"

interface PreferencesTabProps {
  preferredCategoryIds: string[]
  interests: string[]
  categories: ProfileCategory[]
  travelStyle: string | null
  groupType: string | null
  accessibilityNeeds: string[]
  onSave: (data: {
    preferredCategoryIds: string[]
    interests: string[]
    travelStyle: string | null
    groupType: string | null
    accessibilityNeeds: string[]
  }) => void
  saving: boolean
}

export default function PreferencesTab({
  preferredCategoryIds,
  interests,
  categories,
  travelStyle: initialTravelStyle,
  groupType: initialGroupType,
  accessibilityNeeds: initialAccessibilityNeeds,
  onSave,
  saving,
}: PreferencesTabProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(preferredCategoryIds)
  const [currentInterests, setCurrentInterests] = useState<string[]>(interests)
  const [interestInput, setInterestInput] = useState("")
  const [selectedTravelStyle, setSelectedTravelStyle] = useState<string | null>(initialTravelStyle)
  const [selectedGroupType, setSelectedGroupType] = useState<string | null>(initialGroupType)
  const [selectedAccessibilityNeeds, setSelectedAccessibilityNeeds] = useState<string[]>(initialAccessibilityNeeds)

  const hasChanges =
    JSON.stringify(selectedCategoryIds.sort()) !== JSON.stringify(preferredCategoryIds.sort()) ||
    JSON.stringify(currentInterests.sort()) !== JSON.stringify(interests.sort()) ||
    selectedTravelStyle !== initialTravelStyle ||
    selectedGroupType !== initialGroupType ||
    JSON.stringify(selectedAccessibilityNeeds.sort()) !== JSON.stringify(initialAccessibilityNeeds.sort())

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }, [])

  const handleAddInterest = useCallback(() => {
    const tag = interestInput.trim().toLowerCase()
    if (tag && !currentInterests.includes(tag)) {
      setCurrentInterests((prev) => [...prev, tag])
    }
    setInterestInput("")
  }, [interestInput, currentInterests])

  const handleRemoveInterest = useCallback((tag: string) => {
    setCurrentInterests((prev) => prev.filter((t) => t !== tag))
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

  const handleToggleAccessibility = useCallback((need: string) => {
    setSelectedAccessibilityNeeds((prev) =>
      prev.includes(need)
        ? prev.filter((n) => n !== need)
        : [...prev, need],
    )
  }, [])

  return (
    <div className="space-y-8">
      {/* Heritage Categories */}
      <section>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-display text-lg text-ink">
            <Compass size={18} strokeWidth={1.5} className="text-accent" />
            Heritage Interests
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Select the types of heritage sites you enjoy exploring.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id)
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleToggleCategory(category.id)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                    : "border-ink/10 hover:border-ink/25 hover:bg-parchment/30"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected ? "bg-accent text-cream" : "bg-accent/10 text-accent"
                  }`}
                >
                  <Compass size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{formatCategoryName(category.name)}</span>
                    {isSelected && <Check size={14} strokeWidth={2} className="shrink-0 text-accent" />}
                  </div>
                  {category.description && (
                    <span className="mt-0.5 block text-xs text-ink-soft line-clamp-2">
                      {category.description}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Travel Style */}
      <section>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-display text-lg text-ink">
            <Users size={18} strokeWidth={1.5} className="text-accent" />
            Travel Style
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            How do you like to travel?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = selectedTravelStyle === style.value
            return (
              <button
                key={style.value}
                type="button"
                onClick={() => setSelectedTravelStyle(isSelected ? null : style.value)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                    : "border-ink/10 hover:border-ink/25 hover:bg-parchment/30"
                }`}
              >
                <Users size={14} strokeWidth={1.5} className={isSelected ? "text-accent" : "text-ink-soft"} />
                <span className={`text-sm ${isSelected ? "font-medium text-ink" : "text-ink-soft"}`}>
                  {style.label}
                </span>
                {isSelected && <Check size={12} strokeWidth={2} className="ml-auto shrink-0 text-accent" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Group Type */}
      <section>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-display text-lg text-ink">
            <Navigation size={18} strokeWidth={1.5} className="text-accent" />
            Group Type
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            How will you get around?
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {GROUP_TYPES.map((type) => {
            const isSelected = selectedGroupType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedGroupType(isSelected ? null : type.value)}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                  isSelected
                    ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                    : "border-ink/10 hover:border-ink/25 hover:bg-parchment/30"
                }`}
              >
                <span className={`text-sm ${isSelected ? "font-medium text-ink" : "text-ink-soft"}`}>
                  {type.label}
                </span>
                {isSelected && <Check size={12} strokeWidth={2} className="text-accent" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Accessibility Needs */}
      <section>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-display text-lg text-ink">
            <Accessibility size={18} strokeWidth={1.5} className="text-accent" />
            Accessibility Needs
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Select any that apply — this helps us recommend accessible sites.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ACCESSIBILITY_NEEDS.map((need) => {
            const isSelected = selectedAccessibilityNeeds.includes(need.value)
            return (
              <button
                key={need.value}
                type="button"
                onClick={() => handleToggleAccessibility(need.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-ink/10 text-ink-soft hover:border-ink/25"
                }`}
              >
                <Accessibility size={10} strokeWidth={1.5} />
                {need.label}
                {isSelected && <Check size={10} strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Travel Tags */}
      <section>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-display text-lg text-ink">
            <Tag size={18} strokeWidth={1.5} className="text-accent" />
            Travel Tags
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Add tags that describe your travel style and interests.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. history buff, photography, food..."
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

        {currentInterests.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentInterests.map((tag) => (
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

      {/* Save */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onSave({
                preferredCategoryIds: selectedCategoryIds,
                interests: currentInterests,
                travelStyle: selectedTravelStyle,
                groupType: selectedGroupType,
                accessibilityNeeds: selectedAccessibilityNeeds,
              })
            }
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-all hover:bg-ink/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      )}
    </div>
  )
}
