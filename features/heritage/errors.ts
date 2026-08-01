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
