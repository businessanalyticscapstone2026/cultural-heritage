"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  isLoading: boolean
  error: string | null
  permissionState: "prompt" | "granted" | "denied" | "unavailable"
  refresh: () => void
}

export function useGeolocation(): GeolocationState {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied" | "unavailable"
  >("prompt")
  const hasRequested = useRef(false)

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermissionState("unavailable")
      setError("Geolocation is not supported by your browser")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setPermissionState("granted")
        setIsLoading(false)
      },
      (err) => {
        setIsLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState("denied")
          setError("Location access was denied. You can manually select a municipality.")
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out. Please try again.")
        } else {
          setError("Unable to retrieve your location.")
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  useEffect(() => {
    if (hasRequested.current) return
    hasRequested.current = true
    requestLocation()
  }, [requestLocation])

  return {
    latitude,
    longitude,
    isLoading,
    error,
    permissionState,
    refresh: requestLocation,
  }
}
