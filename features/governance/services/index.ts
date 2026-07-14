import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { GovernanceReview, GovernanceReviewWithSite } from "@/types/heritage"

export async function submitForReview(heritageSiteId: string, heritageSiteVersionId: string): Promise<GovernanceReview> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check for existing active review on this site
  const { data: existingReview } = await supabase
    .from("governance_reviews")
    .select("id, status")
    .eq("heritage_site_id", heritageSiteId)
    .eq("status", "submitted")
    .maybeSingle()

  if (existingReview) {
    throw new Error("This heritage site already has a pending submission")
  }

  const { data, error } = await supabase
    .from("governance_reviews")
    .insert({
      heritage_site_id: heritageSiteId,
      heritage_site_version_id: heritageSiteVersionId,
      status: "submitted",
      submitted_by: user.id,
    })
    .select("*")
    .single()

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
      throw new Error("Governance table not found. Please apply the data governance migration in Supabase SQL Editor.")
    }
    throw new Error(`Failed to submit for review: ${error.message}`)
  }

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    heritageSiteVersionId: data.heritage_site_version_id as string,
    status: data.status as GovernanceReview["status"],
    submittedBy: data.submitted_by as string,
    submittedAt: data.submitted_at as string,
    reviewedBy: (data.reviewed_by as string) ?? null,
    reviewedAt: (data.reviewed_at as string) ?? null,
    reviewerComment: (data.reviewer_comment as string) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

export async function getGovernanceQueue(options?: {
  municipalityId?: string
  status?: string
}): Promise<GovernanceReviewWithSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from("governance_reviews")
    .select(`
      *,
      heritage_site:heritage_sites(
        id,
        site_name,
        municipality_id,
        municipality:municipalities(name),
        category:heritage_categories(name)
      ),
      version:heritage_site_versions(snapshot),
      submitter:staff_profiles!governance_reviews_submitted_by_fkey(full_name),
      reviewer:staff_profiles!governance_reviews_reviewed_by_fkey(full_name)
    `)
    .order("submitted_at", { ascending: true })

  if (options?.municipalityId) {
    query = query.eq("heritage_site.municipality_id", options.municipalityId)
  }
  if (options?.status) {
    query = query.eq("status", options.status)
  }

  const { data, error } = await query

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) return []
    throw new Error(`Failed to fetch governance queue: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const site = row.heritage_site as unknown as Record<string, unknown> | null
    const mun = site?.municipality as { name: string }[] | null
    const cat = site?.category as { name: string }[] | null
    const submitter = row.submitter as { full_name: string } | null
    const reviewer = row.reviewer as { full_name: string } | null
    const version = row.version as { snapshot: Record<string, unknown> } | null
    const submittedAt = new Date(row.submitted_at as string)
    const now = new Date()
    const daysPending = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      id: row.id as string,
      heritageSiteId: row.heritage_site_id as string,
      heritageSiteVersionId: row.heritage_site_version_id as string,
      status: row.status as GovernanceReviewWithSite["status"],
      submittedBy: row.submitted_by as string,
      submittedAt: row.submitted_at as string,
      reviewedBy: (row.reviewed_by as string) ?? null,
      reviewedAt: (row.reviewed_at as string) ?? null,
      reviewerComment: (row.reviewer_comment as string) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      siteName: (site?.site_name as string) ?? "Unknown Site",
      municipalityName: mun?.[0]?.name ?? null,
      categoryName: cat?.[0]?.name ?? null,
      submittedByName: submitter?.full_name ?? "Unknown",
      reviewedByName: reviewer?.full_name ?? null,
      snapshot: version?.snapshot ?? {},
      daysPending,
    }
  })
}

export async function getGovernanceReviewById(reviewId: string): Promise<GovernanceReviewWithSite | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("governance_reviews")
    .select(`
      *,
      heritage_site:heritage_sites(
        id,
        site_name,
        municipality_id,
        municipality:municipalities(name),
        category:heritage_categories(name)
      ),
      version:heritage_site_versions(snapshot),
      submitter:staff_profiles!governance_reviews_submitted_by_fkey(full_name),
      reviewer:staff_profiles!governance_reviews_reviewed_by_fkey(full_name)
    `)
    .eq("id", reviewId)
    .maybeSingle()

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) return null
    throw new Error(`Failed to fetch review: ${error.message}`)
  }
  if (!data) return null

  const site = data.heritage_site as unknown as Record<string, unknown> | null
  const mun = site?.municipality as { name: string }[] | null
  const cat = site?.category as { name: string }[] | null
  const submitter = data.submitter as { full_name: string } | null
  const reviewer = data.reviewer as { full_name: string } | null
  const version = data.version as { snapshot: Record<string, unknown> } | null
  const submittedAt = new Date(data.submitted_at as string)
  const now = new Date()
  const daysPending = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24))

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    heritageSiteVersionId: data.heritage_site_version_id as string,
    status: data.status as GovernanceReviewWithSite["status"],
    submittedBy: data.submitted_by as string,
    submittedAt: data.submitted_at as string,
    reviewedBy: (data.reviewed_by as string) ?? null,
    reviewedAt: (data.reviewed_at as string) ?? null,
    reviewerComment: (data.reviewer_comment as string) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    siteName: (site?.site_name as string) ?? "Unknown Site",
    municipalityName: mun?.[0]?.name ?? null,
    categoryName: cat?.[0]?.name ?? null,
    submittedByName: submitter?.full_name ?? "Unknown",
    reviewedByName: reviewer?.full_name ?? null,
    snapshot: version?.snapshot ?? {},
    daysPending,
  }
}

export async function approveSubmission(reviewId: string, comment?: string): Promise<GovernanceReview> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Fetch the review
  const { data: review, error: fetchError } = await supabase
    .from("governance_reviews")
    .select("id, heritage_site_id, status")
    .eq("id", reviewId)
    .single()

  if (fetchError || !review) throw new Error("Review not found")
  if (review.status !== "submitted") throw new Error("Review is not in submitted status")

  // Update the review
  const { data, error } = await supabase
    .from("governance_reviews")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_comment: comment ?? null,
    })
    .eq("id", reviewId)
    .select("*")
    .single()

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
      throw new Error("Governance table not found. Please apply the data governance migration in Supabase SQL Editor.")
    }
    throw new Error(`Failed to approve submission: ${error.message}`)
  }

  // Update the heritage site publication status to published
  const { error: siteError } = await supabase
    .from("heritage_sites")
    .update({ publication_status: "published" })
    .eq("id", review.heritage_site_id)

  if (siteError) throw new Error(`Failed to update site status: ${siteError.message}`)

  // Create a version entry for the status change
  const { data: siteRow } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", review.heritage_site_id)
    .single()

  if (siteRow) {
    await supabase.from("heritage_site_versions").insert({
      heritage_site_id: review.heritage_site_id,
      snapshot: siteRow,
      changed_by: user.id,
      change_type: "status_changed",
    })
  }

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    heritageSiteVersionId: data.heritage_site_version_id as string,
    status: data.status as GovernanceReview["status"],
    submittedBy: data.submitted_by as string,
    submittedAt: data.submitted_at as string,
    reviewedBy: (data.reviewed_by as string) ?? null,
    reviewedAt: (data.reviewed_at as string) ?? null,
    reviewerComment: (data.reviewer_comment as string) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

export async function rejectSubmission(reviewId: string, comment: string): Promise<GovernanceReview> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  if (!comment || comment.trim().length === 0) {
    throw new Error("Rejection comment is required")
  }

  // Fetch the review
  const { data: review, error: fetchError } = await supabase
    .from("governance_reviews")
    .select("id, status")
    .eq("id", reviewId)
    .single()

  if (fetchError || !review) throw new Error("Review not found")
  if (review.status !== "submitted") throw new Error("Review is not in submitted status")

  // Update the review
  const { data, error } = await supabase
    .from("governance_reviews")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_comment: comment,
    })
    .eq("id", reviewId)
    .select("*")
    .single()

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
      throw new Error("Governance table not found. Please apply the data governance migration in Supabase SQL Editor.")
    }
    throw new Error(`Failed to reject submission: ${error.message}`)
  }

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    heritageSiteVersionId: data.heritage_site_version_id as string,
    status: data.status as GovernanceReview["status"],
    submittedBy: data.submitted_by as string,
    submittedAt: data.submitted_at as string,
    reviewedBy: (data.reviewed_by as string) ?? null,
    reviewedAt: (data.reviewed_at as string) ?? null,
    reviewerComment: (data.reviewer_comment as string) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

export async function archiveRecord(heritageSiteId: string, comment: string): Promise<GovernanceReview> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  if (!comment || comment.trim().length === 0) {
    throw new Error("Archive comment is required")
  }

  // Fetch the site to get its current version
  const { data: site, error: siteFetchError } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", heritageSiteId)
    .single()

  if (siteFetchError || !site) throw new Error("Heritage site not found")

  // Create a version snapshot before archiving
  const { data: version } = await supabase
    .from("heritage_site_versions")
    .insert({
      heritage_site_id: heritageSiteId,
      snapshot: site,
      changed_by: user.id,
      change_type: "status_changed",
    })
    .select("id")
    .single()

  if (!version) throw new Error("Failed to create version snapshot for archive")

  // Update the heritage site publication status to archived
  const { error: archiveError } = await supabase
    .from("heritage_sites")
    .update({ publication_status: "archived" })
    .eq("id", heritageSiteId)

  if (archiveError) throw new Error(`Failed to archive site: ${archiveError.message}`)

  // Create the governance review record
  const { data, error } = await supabase
    .from("governance_reviews")
    .insert({
      heritage_site_id: heritageSiteId,
      heritage_site_version_id: version.id,
      status: "archived",
      submitted_by: user.id,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_comment: comment,
    })
    .select("*")
    .single()

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
      throw new Error("Governance table not found. Please apply the data governance migration in Supabase SQL Editor.")
    }
    throw new Error(`Failed to create archive review: ${error.message}`)
  }

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    heritageSiteVersionId: data.heritage_site_version_id as string,
    status: data.status as GovernanceReview["status"],
    submittedBy: data.submitted_by as string,
    submittedAt: data.submitted_at as string,
    reviewedBy: (data.reviewed_by as string) ?? null,
    reviewedAt: (data.reviewed_at as string) ?? null,
    reviewerComment: (data.reviewer_comment as string) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

export async function getGovernanceHistory(heritageSiteId: string): Promise<GovernanceReview[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("governance_reviews")
    .select("*")
    .eq("heritage_site_id", heritageSiteId)
    .order("created_at", { ascending: false })

  if (error) {
    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) return []
    throw new Error(`Failed to fetch governance history: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    heritageSiteId: row.heritage_site_id as string,
    heritageSiteVersionId: row.heritage_site_version_id as string,
    status: row.status as GovernanceReview["status"],
    submittedBy: row.submitted_by as string,
    submittedAt: row.submitted_at as string,
    reviewedBy: (row.reviewed_by as string) ?? null,
    reviewedAt: (row.reviewed_at as string) ?? null,
    reviewerComment: (row.reviewer_comment as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }))
}

export async function getGovernanceStats(): Promise<{
  pending: number
  approved: number
  rejected: number
  archived: number
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [pendingRes, approvedRes, rejectedRes, archivedRes] = await Promise.all([
    supabase.from("governance_reviews").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("governance_reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("governance_reviews").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("governance_reviews").select("id", { count: "exact", head: true }).eq("status", "archived"),
  ])

  return {
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
    archived: archivedRes.count ?? 0,
  }
}
