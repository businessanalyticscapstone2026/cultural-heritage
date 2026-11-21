"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { formatCategoryName } from "@/lib/format-category"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import {
  Compass,
  MapPin,
  Check,
  X,
  Plus,
  Loader2,
  Crosshair,
  Navigation,
  Users,
  Accessibility,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useAuth } from "@/context/auth-context"
import { TRAVEL_STYLES, GROUP_TYPES, ACCESSIBILITY_NEEDS } from "@/lib/constants"
import {
  saveOnboardingStep1Action,
  saveOnboardingStep2Action,
  saveOnboardingStepTravelAction,
  saveOnboardingStepAccessibilityAction,
  completeOnboardingAction,
  getHeritageCategoriesAction,
} from "@/features/onboarding/actions"

const CartoPositron = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

function OnboardingMap({
  center,
  markerLatitude,
  markerLongitude,
  onMapClick,
  onMarkerDrag,
}: {
  center: [number, number]
  markerLatitude: number | null
  markerLongitude: number | null
  onMapClick: (e: { lngLat: { lng: number; lat: number } }) => void
  onMarkerDrag: (e: { lng: number; lat: number }) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: CartoPositron,
      center,
      zoom: 10,
      attributionControl: false,
    })

    map.on("click", (e) => {
      onMapClick({ lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat } })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
    if (markerLatitude != null && markerLongitude != null) {
      const el = document.createElement("div")
      el.innerHTML =
        '<div class="w-6 h-6 bg-[#1D5FA8] rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-grab"><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>'

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([markerLongitude, markerLatitude])
        .addTo(mapRef.current)

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat()
        onMarkerDrag({ lng: lngLat.lng, lat: lngLat.lat })
      })

      markerRef.current = marker
    }
  }, [markerLatitude, markerLongitude])

  return <div ref={containerRef} className="w-full h-full" />
}

interface HeritageCategory {
  id: string
  name: string
  description: string
  icon: string | null
  color: string | null
  display_order: number
}

const iconMap: Record<string, React.ElementType> = {
  Church: Compass,
  BookOpen: Compass,
  Home: MapPin,
  Trees: MapPin,
  Library: Compass,
  Landmark: MapPin,
  Music: Compass,
  Search: MapPin,
  MapPin: MapPin,
}

const currentYear = new Date().getFullYear()

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { session } = useAuth()

  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState<HeritageCategory[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [homeLatitude, setHomeLatitude] = useState<number | null>(null)
  const [homeLongitude, setHomeLongitude] = useState<number | null>(null)
  const [travelStyle, setTravelStyle] = useState<string | null>(null)
  const [groupType, setGroupType] = useState<string | null>(null)
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [interestInput, setInterestInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationSource, setLocationSource] = useState<"none" | "geolocation" | "map">("none")
  const [mapCenter, setMapCenter] = useState<[number, number]>([121.06, 13.88])

  useEffect(() => {
    if (!session) return
    getHeritageCategoriesAction()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [session])

  const userId = session?.user?.id

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }, [])

  const handleUseGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHomeLatitude(position.coords.latitude)
        setHomeLongitude(position.coords.longitude)
        setLocationSource("geolocation")
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  const handleMapClick = useCallback((e: { lngLat: { lng: number; lat: number } }) => {
    setHomeLatitude(e.lngLat.lat)
    setHomeLongitude(e.lngLat.lng)
    setLocationSource("map")
  }, [])

  const handleMapMarkerDrag = useCallback((e: { lng: number; lat: number }) => {
    setHomeLatitude(e.lat)
    setHomeLongitude(e.lng)
  }, [])

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

  const handleToggleAccessibility = useCallback((need: string) => {
    setAccessibilityNeeds((prev) =>
      prev.includes(need)
        ? prev.filter((n) => n !== need)
        : [...prev, need],
    )
  }, [])

  const handleNext = useCallback(async () => {
    if (!userId) return

    setIsSaving(true)
    try {
      if (step === 0) {
        await saveOnboardingStep1Action(userId, selectedCategoryIds)
      } else if (step === 1) {
        await saveOnboardingStep2Action(userId, homeLatitude, homeLongitude)
      } else if (step === 2) {
        await saveOnboardingStepTravelAction(userId, travelStyle, groupType)
      } else if (step === 3) {
        await saveOnboardingStepAccessibilityAction(userId, accessibilityNeeds, interests)
        await completeOnboardingAction(userId)
        router.push("/home")
        return
      }
      setStep((prev) => prev + 1)
    } catch {
      // silently fail
    } finally {
      setIsSaving(false)
    }
  }, [step, userId, selectedCategoryIds, homeLatitude, homeLongitude, travelStyle, groupType, accessibilityNeeds, interests, router])

  const handleSkip = useCallback(async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      await saveOnboardingStep1Action(userId, selectedCategoryIds)
      await saveOnboardingStep2Action(userId, homeLatitude, homeLongitude)
      await saveOnboardingStepTravelAction(userId, travelStyle, groupType)
      await saveOnboardingStepAccessibilityAction(userId, accessibilityNeeds, interests)
      await completeOnboardingAction(userId)
      router.push("/home")
    } catch {
      // silently fail
    } finally {
      setIsSaving(false)
    }
  }, [userId, selectedCategoryIds, homeLatitude, homeLongitude, travelStyle, groupType, accessibilityNeeds, interests, router])

  if (!session) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const steps = [
    { label: "Interests", icon: Compass },
    { label: "Location", icon: Navigation },
    { label: "Travel Style", icon: Users },
    { label: "About You", icon: Accessibility },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Form */}
      <div className="flex-1 flex flex-col justify-center bg-white px-8 lg:px-16 py-10">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo */}
          <div className="mb-8">
            <BrandLogo variant="light" className="mb-4 size-12" />
            <h1 className="text-2xl font-semibold text-[#0B2A4A]">
              {step === 0 && <>Pick your <em className="italic">interests</em></>}
              {step === 1 && <>Where are you <em className="italic">traveling from</em>?</>}
              {step === 2 && <>How do you <em className="italic">like to travel</em>?</>}
              {step === 3 && <>A little about <em className="italic">you</em></>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === 0 && "Select heritage categories you'd like to explore."}
              {step === 1 && "Set your home location for personalized recommendations."}
              {step === 2 && "Tell us your travel style so we can tailor suggestions."}
              {step === 3 && "Help us understand your needs and interests."}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    i <= step
                      ? "bg-[#0B2A4A] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-6 transition-colors ${
                      i < step ? "bg-[#0B2A4A]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 0 — Category Interests */}
          {step === 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {categories.map((category) => {
                const Icon = category.icon ? iconMap[category.icon] || Compass : Compass
                const isSelected = selectedCategoryIds.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleToggleCategory(category.id)}
                    className={`w-full flex items-start gap-3 text-left rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-[#1D5FA8] bg-[#EAF2FB] ring-1 ring-[#1D5FA8]/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-[#1D5FA8]" : "bg-[#EAF2FB]"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? "text-white" : "text-[#1D5FA8]"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0B2A4A]">
                          {formatCategoryName(category.name)}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#1D5FA8] shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-0.5 block">
                        {category.description}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 1 — Home Location */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleUseGeolocation}
                disabled={isLocating}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 transition-all ${
                  locationSource === "geolocation"
                    ? "border-[#1D5FA8] bg-[#EAF2FB] ring-1 ring-[#1D5FA8]/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF2FB] flex items-center justify-center shrink-0">
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 text-[#1D5FA8] animate-spin" />
                  ) : (
                    <Crosshair className="w-5 h-5 text-[#1D5FA8]" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#0B2A4A]">Use my current location</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {locationSource === "geolocation"
                      ? `Lat: ${homeLatitude?.toFixed(4)}, Lng: ${homeLongitude?.toFixed(4)}`
                      : "Allow browser to detect your location"}
                  </span>
                </div>
                {locationSource === "geolocation" && (
                  <Check className="w-4 h-4 text-[#1D5FA8]" />
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">or drop a pin</span>
                </div>
              </div>

              <div
                className={`rounded-xl overflow-hidden border transition-all ${
                  locationSource === "map"
                    ? "border-[#1D5FA8] ring-1 ring-[#1D5FA8]/20"
                    : "border-gray-200"
                }`}
                style={{ height: "280px" }}
              >
                <OnboardingMap
                  center={mapCenter}
                  markerLatitude={homeLatitude}
                  markerLongitude={homeLongitude}
                  onMapClick={handleMapClick}
                  onMarkerDrag={handleMapMarkerDrag}
                />
              </div>

              {homeLatitude != null && homeLongitude != null && locationSource === "map" && (
                <p className="text-xs text-gray-500 text-center">
                  Pin at {homeLatitude.toFixed(4)}, {homeLongitude.toFixed(4)}
                </p>
              )}
            </div>
          )}

          {/* Step 2 — Travel Style & Group Type */}
          {step === 2 && (
            <div className="space-y-8">
              {/* Travel Style */}
              <div>
                <h3 className="text-sm font-semibold text-[#0B2A4A] mb-3">Travel Style</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = travelStyle === style.value
                    return (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => setTravelStyle(style.value)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-[#1D5FA8] bg-[#EAF2FB] ring-1 ring-[#1D5FA8]/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Users className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#1D5FA8]" : "text-gray-400"}`} />
                        <span className={`text-sm ${isSelected ? "font-semibold text-[#0B2A4A]" : "text-gray-600"}`}>
                          {style.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#1D5FA8] ml-auto shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Group Type */}
              <div>
                <h3 className="text-sm font-semibold text-[#0B2A4A] mb-3">How will you get around?</h3>
                <div className="grid grid-cols-3 gap-2">
                  {GROUP_TYPES.map((type) => {
                    const isSelected = groupType === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setGroupType(type.value)}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? "border-[#1D5FA8] bg-[#EAF2FB] ring-1 ring-[#1D5FA8]/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`text-sm ${isSelected ? "font-semibold text-[#0B2A4A]" : "text-gray-600"}`}>
                          {type.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#1D5FA8]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Accessibility Needs + Interest Tags */}
          {step === 3 && (
            <div className="space-y-8">
              {/* Accessibility Needs */}
              <div>
                <h3 className="text-sm font-semibold text-[#0B2A4A] mb-1">Accessibility Needs</h3>
                <p className="text-xs text-gray-500 mb-3">Select any that apply — this helps us recommend accessible sites.</p>
                <div className="flex flex-wrap gap-2">
                  {ACCESSIBILITY_NEEDS.map((need) => {
                    const isSelected = accessibilityNeeds.includes(need.value)
                    return (
                      <button
                        key={need.value}
                        type="button"
                        onClick={() => handleToggleAccessibility(need.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[#1D5FA8] bg-[#EAF2FB] text-[#1D5FA8]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Accessibility className="w-3 h-3" />
                        {need.label}
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Interest Tags */}
              <div>
                <h3 className="text-sm font-semibold text-[#0B2A4A] mb-1">Interest Tags</h3>
                <p className="text-xs text-gray-500 mb-3">Add tags that describe your travel interests.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. history buff, photography, food..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-[#0B2A4A] placeholder:text-gray-400 outline-none transition-colors focus:border-[#1D5FA8] focus:ring-2 focus:ring-[#1D5FA8]/15"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddInterest}
                    disabled={!interestInput.trim()}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {interests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-[#EAF2FB] text-[#1D5FA8] px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(tag)}
                          className="hover:text-[#0B2A4A] transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {interests.length === 0 && (
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    Press Enter to add tags. Leave empty to skip.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((prev) => prev - 1)}
                  disabled={isSaving}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSaving}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Skip for now"}
              </button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSaving || (step === 1 && isLocating)}
                className="bg-[#0B2A4A] hover:bg-[#0B2A4A]/90"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : step < 3 ? (
                  "Next"
                ) : (
                  "Start Exploring"
                )}
              </Button>
            </div>
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 45%)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 text-white">
          <div className="flex items-center gap-3">
            <BrandLogo variant="dark" className="size-11" />
            <div className="text-white leading-tight">
              <p className="text-xs uppercase tracking-wide text-white/70">Batangas Heritage</p>
              <p className="font-semibold text-sm">Tourism DSS</p>
            </div>
          </div>

          <div className="mt-auto mb-14">
            <h2 className="text-3xl font-semibold text-white mb-3">
              Every stone <em className="italic">has a story</em>
            </h2>
            <p className="text-white/80 max-w-xs text-sm leading-relaxed">
              Tell us what speaks to you — and we&apos;ll guide you to the heritage that
              moves you.
            </p>
          </div>

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
