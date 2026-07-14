"use client"

import { useCallback } from "react"
import {
  createHeritageSiteAction,
  updateHeritageSiteAction,
  deleteHeritageSiteAction,
  getHeritageSiteVersionsAction,
  restoreHeritageSiteVersionAction,
} from "../actions/heritage"
import { submitForReviewAction } from "@/features/governance/actions"
import { useHeritageSites } from "../hooks"
import HeritageRepositoryTable from "./heritage-repository-table"
import type { HeritageSite, HeritageCategory, HeritageSiteVersion } from "../types"

interface MtoHeritageClientProps {
  initialSites: HeritageSite[]
  categories: HeritageCategory[]
  municipalityId: string
}

export default function MtoHeritageClient({
  initialSites,
  categories,
  municipalityId,
}: MtoHeritageClientProps) {
  const fetchSites = useCallback(async () => {
    const { getHeritageSitesByMunicipalityAction } = await import("../actions/heritage")
    return getHeritageSitesByMunicipalityAction(municipalityId)
  }, [municipalityId])

  const { sites, refetch } = useHeritageSites(fetchSites)
  const displaySites = sites.length > 0 ? sites : initialSites

  const handleCreate = useCallback(async (data: Partial<HeritageSite>) => {
    await createHeritageSiteAction({ ...data, municipalityId })
    refetch()
  }, [municipalityId, refetch])

  const handleUpdate = useCallback(async (id: string, data: Partial<HeritageSite>) => {
    await updateHeritageSiteAction(id, data)
    refetch()
  }, [refetch])

  const handleDelete = useCallback(async (id: string) => {
    await deleteHeritageSiteAction(id)
    refetch()
  }, [refetch])

  const handleFetchVersions = useCallback(async (siteId: string): Promise<HeritageSiteVersion[]> => {
    return getHeritageSiteVersionsAction(siteId)
  }, [])

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    await restoreHeritageSiteVersionAction(versionId)
    refetch()
  }, [refetch])

  const handleSubmitForReview = useCallback(async (siteId: string, versionId: string) => {
    await submitForReviewAction(siteId, versionId)
    refetch()
  }, [refetch])

  // MTO staff sees only their municipality
  const municipalities = [{ id: municipalityId, name: "" }]

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Heritage Sites</h1>
        <p className="mt-1 text-sm opacity-80">
          Manage heritage sites in your municipality
        </p>
      </div>

      <HeritageRepositoryTable
        sites={displaySites}
        categories={categories}
        municipalities={municipalities}
        onCreateSite={handleCreate}
        onUpdateSite={handleUpdate}
        onDeleteSite={handleDelete}
        onFetchVersions={handleFetchVersions}
        onRestoreVersion={handleRestoreVersion}
        onSubmitForReview={handleSubmitForReview}
      />
    </div>
  )
}
