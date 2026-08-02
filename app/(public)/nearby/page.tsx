"use client"

import { useState, useEffect, useCallback } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useAuth } from "@/context/auth-context"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"
import type { NearbySite, TravelMode, HeritageCategory } from "@/types/heritage"
import {
  LocationPrompt,
  LocationFallback,
  LocationHeader,
  FilterBar,
  MapPreview,
  NearbySitesList,
  EmptyState,
  NearbyLoading,
} from "@/features/nearby/components"
import { WALKING_RADII, DRIVING_RADII } from "@/features/nearby/constants"

export default function NearbyPage() {
  const geo = useGeolocation()
  const { profile: authProfile, isLoading: authLoading } = useAuth()

  const [mode, setMode] = useState<TravelMode>("walking")
  const [radius, setRadius] = useState(3)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<HeritageCategory[]>([])
  const [sites, setSites] = useState<NearbySite[]>([])
  const [loading, setLoading] = useState(true)
  const [manualLocation, setManualLocation] = useState<{
    lat: number
    long: number
    label: string
  } | null>(null)

  const lat = manualLocation?.lat ?? geo.latitude
  const long = manualLocation?.long ?? geo.longitude
  const locationLabel = manualLocation?.label ?? "Detecting location..."
  const hasLocation = lat !== null && long !== null
  const showFallback =
    (!hasLocation && (geo.permissionState === "denied" || geo.permissionState === "unavailable")) ||
    (!hasLocation && geo.permissionState === "prompt" && false)

  const [showFallbackUI, setShowFallbackUI] = useState(false)

  const effectiveShowFallback = showFallbackUI || showFallback

  const fetchNearby = useCallback(async () => {
    if (lat === null || long === null) return []

    const params = new URLSearchParams({
      lat: String(lat),
      long: String(long),
      radius: String(radius),
      mode,
      limit: "20",
    })
    if (selectedCategory) {
      params.set("category", selectedCategory)
    }

    try {
      const res = await fetch(`/api/heritage/nearby?${params}`)
      if (res.ok) {
        const data = await res.json()
        return data.results ?? []
      }
    } catch {
      // ignore
    }
    return []
  }, [lat, long, radius, mode, selectedCategory])

  useEffect(() => {
    let cancelled = false
    fetchNearby().then((results) => {
      if (!cancelled) {
        setSites(results)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [fetchNearby])

  const isLoading = loading

  useEffect(() => {
    let cancelled = false
    async function loadCategories() {
      try {
        const res = await fetch("/api/heritage")
        if (!cancelled && res.ok) {
          const data = await res.json()
          if (data.categories) {
            setCategories(data.categories)
          }
        }
      } catch {
        // Categories are optional
      }
    }
    loadCategories()
    return () => { cancelled = true }
  }, [])

  const handleEnableLocation = () => {
    geo.refresh()
  }

  const handleChooseManual = () => {
    setShowFallbackUI(true)
  }

  const handleManualSelect = (lat: number, long: number, label: string) => {
    setManualLocation({ lat, long, label })
    setShowFallbackUI(false)
  }

  const handleExpandRadius = () => {
    const radii = mode === "driving" ? DRIVING_RADII : WALKING_RADII
    const currentIdx = radii.indexOf(radius)
    if (currentIdx < radii.length - 1) {
      setRadius(radii[currentIdx + 1])
    } else {
      setRadius(radii[radii.length - 1])
    }
  }

  const handleModeChange = (newMode: TravelMode) => {
    setMode(newMode)
    if (newMode === "driving" && radius <= 5) {
      setRadius(10)
    } else if (newMode === "walking" && radius >= 20) {
      setRadius(3)
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-10">
        <div className="h-72 animate-pulse rounded-3xl border border-ink/10 bg-card" />
      </div>
    )
  }

  if (!authProfile) {
    return (
      <RestrictedGuestPrompt
        title="Sign in to view nearby sites"
        description="Discover heritage sites closest to you in the First District of Batangas."
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-10">
      <div className="mb-8">
        <h1 className="text-display text-2xl text-ink">Nearby Attractions</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Discover heritage sites closest to you in the First District of Batangas.
        </p>
      </div>

      {effectiveShowFallback && !hasLocation ? (
        <LocationFallback
          onSelect={handleManualSelect}
          onCancel={() => setShowFallbackUI(false)}
        />
      ) : !hasLocation && geo.permissionState === "prompt" ? (
        <LocationPrompt
          onEnableLocation={handleEnableLocation}
          onChooseManual={handleChooseManual}
        />
      ) : (
        <>
          {hasLocation && (
            <LocationHeader
              latitude={lat}
              longitude={long}
              locationLabel={locationLabel}
              mode={mode}
              onModeChange={handleModeChange}
              onChangeLocation={() => setShowFallbackUI(true)}
              onRefresh={manualLocation ? () => { setManualLocation(null); geo.refresh() } : geo.refresh}
            />
          )}

          {isLoading ? (
            <NearbyLoading />
          ) : (
            <>
              <MapPreview
                latitude={lat!}
                longitude={long!}
                sites={sites}
              />

              <FilterBar
                mode={mode}
                radius={radius}
                onRadiusChange={setRadius}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                resultCount={sites.length}
              />

              {sites.length === 0 ? (
                <EmptyState
                  radius={radius}
                  onExpandRadius={handleExpandRadius}
                />
              ) : (
                <NearbySitesList sites={sites} mode={mode} />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
