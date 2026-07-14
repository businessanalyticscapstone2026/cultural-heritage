import { z } from "zod"

export const submitForReviewSchema = z.object({
  heritageSiteId: z.string().uuid("Invalid heritage site"),
  heritageSiteVersionId: z.string().uuid("Invalid version"),
})

export type SubmitForReviewValues = z.infer<typeof submitForReviewSchema>

export const reviewDecisionSchema = z.object({
  reviewId: z.string().uuid("Invalid review"),
  comment: z.string().min(1, "Comment is required").max(2000),
})

export type ReviewDecisionValues = z.infer<typeof reviewDecisionSchema>

export const archiveRecordSchema = z.object({
  heritageSiteId: z.string().uuid("Invalid heritage site"),
  comment: z.string().min(1, "Comment is required").max(2000),
})

export type ArchiveRecordValues = z.infer<typeof archiveRecordSchema>

export const governanceQueueFilterSchema = z.object({
  municipalityId: z.string().uuid().nullable().optional(),
  status: z.enum(["submitted", "approved", "rejected", "archived"]).nullable().optional(),
})

export type GovernanceQueueFilterValues = z.infer<typeof governanceQueueFilterSchema>
