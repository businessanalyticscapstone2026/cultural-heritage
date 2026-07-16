"use client"

import { useState, useCallback, useEffect } from "react"
import type { TravelMode } from "@/types/heritage"
import { WALKING_RADII, DRIVING_RADII } from "../constants"

const STORAGE_KEY = "heritage-nearby-radius-prefs"

interface NearbyRadiusPrefs {
  mode: TravelMode
  radius: number
}

function loadPrefs(): NearbyRadiusPrefs {
  if (typeof window === "undefined") return { mode: "walking", radius: 3 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { mode: "walking", radius: 3 }
    const parsed = JSON.parse(raw) as NearbyRadiusPrefs
    if (parsed.mode !== "walking" && parsed.mode !== "driving") return { mode: "walking", radius: 3 }
    return parsed
  } catch {
    return { mode: "walking", radius: 3 }
  }
}

function savePrefs(prefs: NearbyRadiusPrefs): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Storage full or unavailable
  }
}

interface UseNearbyRadiusReturn {
  mode: TravelMode
  radius: number
  radii: readonly number[]
  setMode: (mode: TravelMode) => void
  setRadius: (radius: number) => void
  expandRadius: () => void
}

export function useNearbyRadius(defaultMode: TravelMode = "walking", defaultRadius = 3): UseNearbyRadiusReturn {
  const [mode, setModeState] = useState<TravelMode>(defaultMode)
  const [radius, setRadiusState] = useState(defaultRadius)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const prefs = loadPrefs()
    setModeState(prefs.mode)
    setRadiusState(prefs.radius)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      savePrefs({ mode, radius })
    }
  }, [mode, radius, loaded])

  const radii = mode === "driving" ? DRIVING_RADII : WALKING_RADII

  const setMode = useCallback((newMode: TravelMode) => {
    setModeState((prev) => {
      if (prev === newMode) return prev
      if (newMode === "driving" && radius <= 5) {
        setRadiusState(10)
      } else if (newMode === "walking" && radius >= 20) {
        setRadiusState(3)
      }
      return newMode
    })
  }, [radius])

  const setRadius = useCallback((newRadius: number) => {
    setRadiusState(newRadius)
  }, [])

  const expandRadius = useCallback(() => {
    const currentRadii = mode === "driving" ? DRIVING_RADII : WALKING_RADII
    const currentIdx = currentRadii.indexOf(radius)
    if (currentIdx < currentRadii.length - 1) {
      setRadiusState(currentRadii[currentIdx + 1])
    } else {
      setRadiusState(currentRadii[currentRadii.length - 1])
    }
  }, [mode, radius])

  return { mode, radius, radii, setMode, setRadius, expandRadius }
}
