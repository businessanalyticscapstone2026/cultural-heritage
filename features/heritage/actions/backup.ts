"use server"

import { revalidatePath } from "next/cache"
import { backupHeritageRepository, getBackupsList } from "../services"

export async function createBackupAction(options?: { name?: string }) {
  const backup = await backupHeritageRepository(options)
  revalidatePath("/admin/data-governance")
  return backup
}

export async function getBackupsListAction() {
  return getBackupsList()
}
