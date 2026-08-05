"use client"

import { useCallback } from "react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { updateHeritageSiteAction, getArchivedSitesByMunicipalityAction } from "../actions/heritage"
import { deleteMtoSiteAction } from "../actions/mto-sites"
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

  const handleDelete = useCallback(async (id: string) => {
    await deleteMtoSiteAction(id)
    refetch()
  }, [refetch])

  return (
    <ArchiveList
      sites={displaySites}
      onRestore={handleRestore}
      onDelete={handleDelete}
    />
  )
}
