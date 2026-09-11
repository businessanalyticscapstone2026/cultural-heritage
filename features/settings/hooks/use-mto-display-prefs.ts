"use client"

import { useCallback, useState } from "react"

export type MtoDisplayPrefs = {
  language: "en" | "fil" | "tl"
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  rowsPerPage: number
}

const STORAGE_KEY = "mto-display-prefs"

const DEFAULT_PREFS: MtoDisplayPrefs = {
  language: "en",
  dateFormat: "MM/DD/YYYY",
  rowsPerPage: 10,
}

const VALID_LANGUAGES = ["en", "fil", "tl"] as const
const VALID_DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const
const VALID_ROWS = [5, 10, 20, 50]

function parseStored(value: string | null): MtoDisplayPrefs {
  if (!value) return DEFAULT_PREFS
  try {
    const parsed = JSON.parse(value) as Partial<MtoDisplayPrefs>
    return {
      language: VALID_LANGUAGES.includes(parsed.language as MtoDisplayPrefs["language"])
        ? (parsed.language as MtoDisplayPrefs["language"])
        : DEFAULT_PREFS.language,
      dateFormat: VALID_DATE_FORMATS.includes(parsed.dateFormat as MtoDisplayPrefs["dateFormat"])
        ? (parsed.dateFormat as MtoDisplayPrefs["dateFormat"])
        : DEFAULT_PREFS.dateFormat,
      rowsPerPage:
        typeof parsed.rowsPerPage === "number" && VALID_ROWS.includes(parsed.rowsPerPage)
          ? parsed.rowsPerPage
          : DEFAULT_PREFS.rowsPerPage,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

function readStored(): { prefs: MtoDisplayPrefs; loaded: boolean } {
  if (typeof window === "undefined") return { prefs: DEFAULT_PREFS, loaded: false }
  try {
    return { prefs: parseStored(window.localStorage.getItem(STORAGE_KEY)), loaded: true }
  } catch {
    return { prefs: DEFAULT_PREFS, loaded: true }
  }
}

/**
 * Per-device display preferences for MTO users, persisted in localStorage.
 * Foundation for future per-table/i18n wiring — nothing consumes these yet.
 */
export function useMtoDisplayPrefs() {
  const [state, setState] = useState(readStored)

  const savePrefs = useCallback((next: MtoDisplayPrefs) => {
    setState((prev) => ({ ...prev, prefs: next }))
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable (private mode, quota) — keep in-memory values
    }
  }, [])

  return { prefs: state.prefs, loaded: state.loaded, savePrefs }
}
