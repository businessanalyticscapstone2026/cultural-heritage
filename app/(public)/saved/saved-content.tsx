"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getBookmarkedSitesAction, toggleBookmarkAction } from "@/features/heritage/actions/bookmark"
import type { SavedSite } from "@/types/heritage"
import {
  SavedHeader,
  SavedSitesList,
  UndoToast,
  EmptyState,
} from "@/features/bookmarks/components"
import { Reveal } from "@/components/animations/reveal"

interface UndoState {
  siteId: string
  siteName: string
  municipalityName: string | null
  categoryName: string | null
  thumbnail: string | null
  savedAt: string
}

export default function SavedSitesPageContent() {
  const [sites, setSites] = useState<SavedSite[] | null>(null)
  const [municipalityFilter, setMunicipalityFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [undoState, setUndoState] = useState<UndoState | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = sites === null

  useEffect(() => {
    let cancelled = false

    getBookmarkedSitesAction()
      .then((data) => {
        if (!cancelled) setSites(data)
      })
      .catch(() => {
        if (!cancelled) setSites([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const municipalities = [
    ...new Set((sites ?? []).map((s) => s.municipalityName).filter(Boolean)),
  ] as string[]
  const categories = [
    ...new Set((sites ?? []).map((s) => s.categoryName).filter(Boolean)),
  ] as string[]

  const filteredSites = (sites ?? []).filter((site) => {
    if (municipalityFilter && site.municipalityName !== municipalityFilter) return false
    if (categoryFilter && site.categoryName !== categoryFilter) return false
    return true
  })

  const handleRemove = useCallback(async (siteId: string) => {
    setSites((prev) => {
      if (!prev) return prev
      const site = prev.find((s) => s.siteId === siteId)
      if (!site) return prev

      setUndoState({
        siteId,
        siteName: site.siteName,
        municipalityName: site.municipalityName,
        categoryName: site.categoryName,
        thumbnail: site.thumbnail,
        savedAt: site.savedAt,
      })

      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }

      undoTimerRef.current = setTimeout(async () => {
        try {
          await toggleBookmarkAction(siteId)
        } catch {
          setSites((latest) => {
            if (!latest) return [site]
            const exists = latest.some((s) => s.siteId === siteId)
            if (exists) return latest
            return [...latest, site]
          })
        }
        setUndoState(null)
      }, 5000)

      return prev.filter((s) => s.siteId !== siteId)
    })
  }, [])

  const handleUndo = useCallback(async () => {
    if (!undoState) return

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }

    try {
      await toggleBookmarkAction(undoState.siteId)
      setSites((prev) => {
        if (!prev) return prev
        const exists = prev.some((s) => s.siteId === undoState.siteId)
        if (exists) return prev
        return [
          ...prev,
          {
            siteId: undoState.siteId,
            siteName: undoState.siteName,
            municipalityName: undoState.municipalityName,
            categoryName: undoState.categoryName,
            thumbnail: undoState.thumbnail,
            savedAt: undoState.savedAt,
          },
        ]
      })
    } catch {
      // If undo fails, the site was already removed
    }

    setUndoState(null)
  }, [undoState])

  const handleDismissUndo = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
    setUndoState(null)
  }, [])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-10">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-parchment" />
          <div className="h-4 w-32 animate-pulse rounded bg-parchment" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-ink/10 bg-cream p-4">
              <div className="aspect-[4/3] animate-pulse rounded-xl bg-parchment" />
              <div className="h-3 w-20 animate-pulse rounded bg-parchment" />
              <div className="h-4 w-32 animate-pulse rounded bg-parchment" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 md:px-6 lg:px-10">
      <Reveal className="mb-8">
        <h1 className="text-display text-2xl text-ink">Saved Destinations</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your bookmarked heritage sites, ready to explore.
        </p>
      </Reveal>

      <Reveal>
        <SavedHeader
          count={sites.length}
          municipalities={municipalities}
          categories={categories}
          onMunicipalityFilter={setMunicipalityFilter}
          onCategoryFilter={setCategoryFilter}
          activeMunicipality={municipalityFilter}
          activeCategory={categoryFilter}
        />
      </Reveal>

      {sites.length === 0 ? (
        <Reveal><EmptyState /></Reveal>
      ) : filteredSites.length === 0 ? (
        <Reveal>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-ink-soft">
              No sites match the current filters.
            </p>
            <button
              onClick={() => {
                setMunicipalityFilter(null)
                setCategoryFilter(null)
              }}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        </Reveal>
      ) : (
        <SavedSitesList sites={filteredSites} onRemove={handleRemove} />
      )}

      {undoState && (
        <UndoToast
          siteName={undoState.siteName}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
        />
      )}
    </div>
  )
}
