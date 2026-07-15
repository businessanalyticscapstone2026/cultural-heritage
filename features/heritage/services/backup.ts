import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { HeritageBackup } from "../types"

export async function backupHeritageRepository(options?: { name?: string }): Promise<HeritageBackup> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [sitesRes, categoriesRes, mediaRes, tagsRes, linksRes] = await Promise.all([
    supabase.from("heritage_sites").select("*"),
    supabase.from("heritage_categories").select("*"),
    supabase.from("heritage_site_media").select("*"),
    supabase.from("heritage_site_tags").select("*"),
    supabase.from("heritage_site_reference_links").select("*"),
  ])

  const backupData = {
    sites: sitesRes.data ?? [],
    categories: categoriesRes.data ?? [],
    media: mediaRes.data ?? [],
    tags: tagsRes.data ?? [],
    referenceLinks: linksRes.data ?? [],
    exportedAt: new Date().toISOString(),
  }

  const backupJson = JSON.stringify(backupData)
  const recordsCount = (sitesRes.data?.length ?? 0) + (categoriesRes.data?.length ?? 0)

  const { data: backup, error } = await supabase
    .from("backups")
    .insert({
      backup_name: options?.name ?? `Backup ${new Date().toISOString().split("T")[0]}`,
      type: "full",
      size_bytes: new TextEncoder().encode(backupJson).length,
      records_count: recordsCount,
      created_by: user?.id ?? null,
      status: "completed",
      file_url: null,
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create backup: ${error.message}`)

  return {
    id: backup.id as string,
    backupName: (backup.backup_name as string) ?? null,
    type: (backup.type as HeritageBackup["type"]) ?? null,
    sizeBytes: (backup.size_bytes as number) ?? null,
    recordsCount: (backup.records_count as number) ?? null,
    createdBy: (backup.created_by as string) ?? null,
    status: (backup.status as string) ?? null,
    fileUrl: (backup.file_url as string) ?? null,
    createdAt: backup.created_at as string,
  }
}

export async function getBackupsList(): Promise<HeritageBackup[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("backups")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    backupName: (row.backup_name as string) ?? null,
    type: (row.type as HeritageBackup["type"]) ?? null,
    sizeBytes: (row.size_bytes as number) ?? null,
    recordsCount: (row.records_count as number) ?? null,
    createdBy: (row.created_by as string) ?? null,
    status: (row.status as string) ?? null,
    fileUrl: (row.file_url as string) ?? null,
    createdAt: row.created_at as string,
  }))
}
