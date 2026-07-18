"use client"

import { useEffect, useState, useCallback } from "react"
import { getMtoSitesAction } from "@/features/heritage/actions/mto-sites"
import {
  getMediaAction,
  getMediaSettingsAction,
  setPrimaryImageAction,
  deleteMediaAction,
} from "@/features/media/actions/media"
import UploadOrchestrator from "@/features/media/components/upload-orchestrator"
import MediaLibraryTabs from "@/features/media/components/media-library-tabs"
import MediaGrid from "@/features/media/components/media-grid"
import DeleteConfirmationModal from "@/features/media/components/delete-confirmation-modal"
import { Skeleton } from "@/components/ui/skeleton"
import type { HeritageSite, HeritageSiteMedia } from "@/types/heritage"
import type { MediaSettings, MediaTabType } from "@/features/media/types"

export default function MediaPageClient() {
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<string>("")
  const [media, setMedia] = useState<HeritageSiteMedia[]>([])
  const [settings, setSettings] = useState<MediaSettings | null>(null)
  const [activeTab, setActiveTab] = useState<MediaTabType>("image")
  const [deleteTarget, setDeleteTarget] = useState<HeritageSiteMedia | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastLoadedSiteId, setLastLoadedSiteId] = useState<string>("")

  useEffect(() => {
    Promise.all([
      getMtoSitesAction().catch(() => [] as HeritageSite[]),
      getMediaSettingsAction().catch(() => null),
    ]).then(([sitesResult, settingsResult]) => {
      setSites(sitesResult)
      setSettings(settingsResult)
      setLoading(false)
      if (sitesResult.length > 0) {
        setSelectedSiteId(sitesResult[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedSiteId) return
    let cancelled = false
    getMediaAction(selectedSiteId)
      .then((data) => {
        if (!cancelled) {
          setMedia(data)
          setLastLoadedSiteId(selectedSiteId)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMedia([])
          setLastLoadedSiteId(selectedSiteId)
        }
      })
    return () => { cancelled = true }
  }, [selectedSiteId])

  const mediaLoading = selectedSiteId !== "" && selectedSiteId !== lastLoadedSiteId

  const handleUploadComplete = useCallback(
    (newMedia: HeritageSiteMedia) => {
      setMedia((prev) => [newMedia, ...prev])
    },
    []
  )

  const handleSetPrimary = useCallback(
    async (mediaId: string) => {
      if (!selectedSiteId) return
      try {
        await setPrimaryImageAction(selectedSiteId, mediaId)
        setMedia((prev) =>
          prev.map((m) => ({
            ...m,
            isPrimary: m.mediaType === "image" ? m.id === mediaId : m.isPrimary,
          }))
        )
      } catch {
        // keep current state
      }
    },
    [selectedSiteId]
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !selectedSiteId) return
    setIsDeleting(true)
    try {
      await deleteMediaAction(selectedSiteId, deleteTarget.id)
      setMedia((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // keep current state
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, selectedSiteId])

  const filteredMedia = media.filter((m) => m.mediaType === activeTab)

  const counts: Record<MediaTabType, number> = {
    image: media.filter((m) => m.mediaType === "image").length,
    document: media.filter((m) => m.mediaType === "document").length,
    video: media.filter((m) => m.mediaType === "video").length,
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage images, documents, and videos for your heritage sites.
        </p>
      </div>

      <div>
        <label htmlFor="site-select" className="mb-1.5 block text-sm font-medium">
          Select heritage site
        </label>
        <select
          id="site-select"
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="w-full max-w-md rounded-lg border bg-background px-3 py-2 text-sm"
        >
          {sites.length === 0 && <option value="">No sites available</option>}
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.siteName}
            </option>
          ))}
        </select>
      </div>

      {selectedSiteId && settings && (
        <UploadOrchestrator
          siteId={selectedSiteId}
          settings={settings}
          onUploadComplete={handleUploadComplete}
        />
      )}

      <div className="space-y-4">
        <MediaLibraryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {mediaLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <MediaGrid
            media={filteredMedia}
            onSetPrimary={handleSetPrimary}
            onDelete={setDeleteTarget}
            onReplace={() => {}}
          />
        )}
      </div>

      <DeleteConfirmationModal
        media={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  )
}
