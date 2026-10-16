/** Thrown when a heritage site with the same name already exists in the same municipality. */
export class DuplicateHeritageSiteError extends Error {
  readonly status = 409
  readonly code = "DUPLICATE_HERITAGE_SITE"

  constructor(
    public siteName: string,
    public municipalityName?: string | null,
  ) {
    super(
      municipalityName
        ? `A heritage site named "${siteName}" already exists in ${municipalityName}.`
        : `A heritage site named "${siteName}" already exists in this municipality.`,
    )
    this.name = "DuplicateHeritageSiteError"
  }
}

export type SiteDeleteFailureReason =
  | "not_found"
  | "not_archived"
  | "wrong_municipality"
  | "still_referenced"
  | "permission_denied"
  | "unknown"

const SITE_DELETE_MESSAGES: Record<SiteDeleteFailureReason, string> = {
  not_found: "This site no longer exists.",
  not_archived: "Only archived sites can be permanently deleted.",
  wrong_municipality: "You do not have permission to delete this site.",
  still_referenced: "This site is still referenced by other records and could not be deleted.",
  permission_denied: "You do not have permission to delete this site.",
  unknown: "Failed to delete site. Please try again or contact support.",
}

/**
 * Thrown when a heritage site cannot be permanently deleted. Carries a safe,
 * user-facing message plus a server-only `detail` string for diagnostics.
 */
export class SiteDeleteError extends Error {
  readonly reason: SiteDeleteFailureReason
  readonly detail?: string

  constructor(reason: SiteDeleteFailureReason, detail?: string) {
    super(SITE_DELETE_MESSAGES[reason])
    this.name = "SiteDeleteError"
    this.reason = reason
    this.detail = detail
  }
}
