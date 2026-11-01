import {
  REVIEWS_METHODS,
  handlePreflight,
  handleReviewsGet,
  handleReviewsPost,
} from "@/features/portal-api/services/route-handlers"

// CHT-136 Taal portal API. Logic lives in features/portal-api.

export function GET(request: Request) {
  return handleReviewsGet(request)
}

export function POST(request: Request) {
  return handleReviewsPost(request)
}

export function OPTIONS(request: Request) {
  return handlePreflight(request, REVIEWS_METHODS)
}
