import {
  HERITAGE_SITES_METHODS,
  handleHeritageSitesGet,
  handlePreflight,
} from "@/features/portal-api/services/route-handlers"

// CHT-136 Taal portal API. Logic lives in features/portal-api.

export function GET(request: Request) {
  return handleHeritageSitesGet(request)
}

export function OPTIONS(request: Request) {
  return handlePreflight(request, HERITAGE_SITES_METHODS)
}
