"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { User } from "@supabase/supabase-js"

interface UserLocationState {
  /** Primary: browser geolocation latitude */
  latitude: number | null
  /** Primary: browser geolocation longitude */
  longitude: number | null
  /** Whether location is being determined */
  isLoading: boolean
  /** Error message if location unavailable */
  error: string | null
  /** Source of the location data */
  source: "browser" | "profile" | "none"
  /** Retry fetching browser location */
  refresh: () => void
}

/**
 * Determines user location by priority:
 * 1. Browser Geolocation API (real-time, session-only)
 * 2. `tourist_profiles.home_latitude/home_longitude` (if logged-in tourist)
 *
 * Browser geolocation is the default. If permission is denied AND the user
 * has a home location saved in their profile, we fall back to that.
 */
export function useUserLocation(
  user: User | null,
  homeLatitude: number | null,
  homeLongitude: number | null,
): UserLocationState {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<"browser" | "profile" | "none">("none")
  const hasRequested = useRef(false)

  const requestBrowserLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      fallbackToProfile()
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setSource("browser")
        setIsLoading(false)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          fallbackToProfile()
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out.")
          fallbackToProfile()
        } else {
          setError("Unable to retrieve your location.")
          fallbackToProfile()
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [homeLatitude, homeLongitude])

  function fallbackToProfile() {
    if (user && homeLatitude != null && homeLongitude != null) {
      setLatitude(homeLatitude)
      setLongitude(homeLongitude)
      setSource("profile")
      setIsLoading(false)
    } else {
      setSource("none")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasRequested.current) return
    hasRequested.current = true
    requestBrowserLocation()
  }, [requestBrowserLocation])

  return {
    latitude,
    longitude,
    isLoading,
    error,
    source,
    refresh: requestBrowserLocation,
  }
}
