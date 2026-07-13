"use client"

import { useCallback } from "react"
import { updateHeritageSiteAction, getArchivedSitesByMunicipalityAction } from "../actions/heritage"
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

  const { sites, refetch } = useHeritageSites(fetchSites)
  const displaySites = sites.length > 0 ? sites : initialSites

  const handleRestore = useCallback(async (id: string) => {
    await updateHeritageSiteAction(id, { publicationStatus: "draft" })
    refetch()
  }, [refetch])

  return (
    <ArchiveList
      sites={displaySites}
      onRestore={handleRestore}
    />
  )
}
