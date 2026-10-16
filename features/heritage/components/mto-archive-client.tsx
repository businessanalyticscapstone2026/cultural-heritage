"use client"

import { useCallback } from "react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { updateHeritageSiteAction, getArchivedSitesByMunicipalityAction } from "../actions/heritage"
import { deleteMtoSiteAction, deleteMtoSitesAction } from "../actions/mto-sites"
import type { BatchDeleteSiteResult } from "../actions/mto-sites"
import { useHeritageSites } from "../hooks"
import ArchiveList from "./archive-list"
import type { HeritageSite } from "../types"

interface MtoArchiveClientProps {
  initialSites: HeritageSite[]
  municipalityId: string
}

export default function MtoArchiveClient({
  initialSites,
  municipalityId,
}: MtoArchiveClientProps) {
  const fetchSites = useCallback(async () => {
    return getArchivedSitesByMunicipalityAction(municipalityId)
  }, [municipalityId])

  const { sites, loading, refetch } = useHeritageSites(fetchSites)
  const displaySites = loading && sites.length === 0 ? initialSites : sites

  const handleRestore = useCallback(async (id: string) => {
    try {
      await updateHeritageSiteAction(id, { publicationStatus: "draft" })
      notifySuccess("Heritage site restored to draft.")
      refetch()
    } catch (err) {
      notifyError(errorReason(err, "Failed to restore site. Please try again."))
    }
  }, [refetch])

  const handleDelete = useCallback(async (id: string): Promise<{ ok: boolean; reason?: string }> => {
    const result = await deleteMtoSiteAction(id)
    if (!result.success) return { ok: false, reason: result.error }
    refetch()
    return { ok: true }
  }, [refetch])

  const handleDeleteMany = useCallback(async (ids: string[]): Promise<BatchDeleteSiteResult> => {
    const result = await deleteMtoSitesAction(ids)
    refetch()
    return result
  }, [refetch])

  return (
    <ArchiveList
      sites={displaySites}
      onRestore={handleRestore}
      onDelete={handleDelete}
      onDeleteMany={handleDeleteMany}
    />
  )
}
