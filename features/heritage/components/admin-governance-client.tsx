"use client"

import { useCallback } from "react"
import { createBackupAction, getBackupsListAction } from "../actions/backup"
import { useBackups } from "../hooks"
import BackupPanel from "./backup-panel"
import type { HeritageBackup } from "../types"

interface AdminGovernanceClientProps {
  initialBackups: HeritageBackup[]
}

export default function AdminGovernanceClient({
  initialBackups,
}: AdminGovernanceClientProps) {
  const fetchBackups = useCallback(async () => {
    return getBackupsListAction()
  }, [])

  const { backups, refetch } = useBackups(fetchBackups)
  const displayBackups = backups.length > 0 ? backups : initialBackups

  const handleCreateBackup = useCallback(async () => {
    await createBackupAction()
    refetch()
  }, [refetch])

  return (
    <BackupPanel
      backups={displayBackups}
      onCreateBackup={handleCreateBackup}
    />
  )
}
