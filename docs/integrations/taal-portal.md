# Taal Municipal Portal Integration (CHT-136)

How the Taal municipal portal reads heritage sites and reviews from the central
Batangas Cultural Tourism database (TCDSS) and writes reviews back.

Machine-readable contract: [`docs/api/taal-portal.openapi.yaml`](../api/taal-portal.openapi.yaml) (OpenAPI 3.1).
Server code: `features/portal-api/` (routes in `app/api/v1/taal/`).

The API is REST only. The TCDSS repository has no GraphQL layer, and adding
one for three endpoints is not justified.

## 1. Base URL

```
TCDSS_API_BASE = <TCDSS origin>/api/v1/taal
```

Configure the TCDSS origin per environment on the portal side (for example
`TCDSS_BASE_URL`). Do not hardcode it.

| Method | Path | Auth |
|---|---|---|
| GET | `/heritage-sites` | none (public data) |
| GET | `/reviews` | none (public data) |
| POST | `/reviews` | `Authorization: Bearer <Supabase access token>` |
| OPTIONS | both paths | CORS preflight |

## 2. What "real-time" means here

There is one database. A review posted through the portal is written directly
into the same Postgres tables, through the same validation and the same atomic
write function (`submit_review`), as a review posted on the main TCDSS site.
Nothing is copied or queued.

After a write from either platform, the server-side caches for these
endpoints are invalidated at once. A new GET then returns the change, subject
only to the CDN window below (at most about 60 seconds). There are no
WebSockets or push notifications. The portal should poll with
`updated_since` (section 6).

## 3. Authentication (POST only)

- Send `Authorization: Bearer <access_token>`, where the token is a Supabase
  access token for a user of **the TCDSS Supabase project**.
- The server verifies it with Supabase Auth (`auth.getUser`) and runs the write
  as that user, so the database's row-level security applies exactly as on the
  main site. No service-role key is used.
- The user must be a tourist (have a `tourist_profiles` row). Staff accounts get
  `403 no_tourist_profile`.
- Tokens expire (Supabase default: 1 hour). Refresh them with the Supabase
  client before you call the API. A `401` means you need to refresh or sign in again.
- **Open question:** this only works if portal users sign in to the TCDSS
  Supabase project (for example, the portal uses the same Supabase Auth). If the
  portal has its own user accounts, POST has no valid identity. A partner
  API-key design would be needed instead. That conflicts with the TCDSS
  architecture rules and has not been built.

GET requests need no credentials. Never send cookies. The API ignores them and
does not allow credentialed CORS.

## 4. Requests and responses

### Success envelope

```json
{ "data": [ ... ], "meta": { "page": 1, "pageSize": 20, "total": 45, "totalPages": 3, "hasMore": true, "updatedSince": null } }
```

POST returns `{ "data": <Review> }`.

### Error envelope

```json
{ "error": "Human-readable message", "code": "validation_failed", "details": { "criteria.safety": ["Please rate this criterion"] } }
```

`details` is present only on `422`. Messages are safe to show to users. They never contain stack traces or internal detail.

### GET /heritage-sites

```
GET /api/v1/taal/heritage-sites?page=1&page_size=20&sort=updated_desc
```

Returns only sites that are **published** and **public**, in the Taal
municipality. Example item:

```json
{
  "id": "6f1c...-uuid",
  "name": "Basilica of St. Martin de Tours",
  "alternativeName": null,
  "municipality": "Taal",
  "category": "Church",
  "barangay": "Poblacion",
  "address": null,
  "shortDescription": "...",
  "detailedDescription": "...",
  "historicalPeriod": "Spanish Colonial",
  "yearEstablished": "1856",
  "historicalSignificance": null,
  "culturalSignificance": null,
  "latitude": 13.88,
  "longitude": 120.92,
  "accessibilityInfo": null,
  "operatingHours": null,
  "entranceFee": null,
  "designation": null,
  "isFeatured": true,
  "averageRating": 4.5,
  "reviewCount": 12,
  "images": [{ "url": "https://...", "caption": "Facade", "isPrimary": true }],
  "createdAt": "2026-01-01T00:00:00+00:00",
  "updatedAt": "2026-10-01T00:00:00+00:00"
}
```

### GET /reviews

```
GET /api/v1/taal/reviews?site_id=<uuid>&page=1&page_size=20
```

Returns published reviews of published Taal sites. `site_id` is optional. If
the site is not a published Taal site, the response is `404`. Example item:

```json
{
  "id": "uuid",
  "siteId": "uuid",
  "rating": 4,
  "comment": "Worth the trip.",
  "isAnonymous": true,
  "authorName": "Anonymous Visitor",
  "criteria": [{ "key": "safety", "score": 5 }],
  "tags": ["rich_history"],
  "media": [{ "mediaType": "image", "url": "https://...", "sortOrder": 0 }],
  "createdAt": "...",
  "updatedAt": "..."
}
```

Reviews never include user ids, emails, moderation status or original file
names. For anonymous reviews, the author's name is never sent.

### POST /reviews

```http
POST /api/v1/taal/reviews
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{
  "siteId": "6f1c...-uuid",
  "criteria": {
    "site_condition": 5, "cultural_value": 5, "accessibility": 4,
    "guides_information": 4, "safety": 5, "value_for_money": 4
  },
  "tags": ["rich_history", "great_photo_spot"],
  "comment": "Worth the trip.",
  "isAnonymous": false,
  "media": []
}
```

- `201 Created`: this user had no review for the site yet.
- `200 OK`: the user's existing review was replaced. Sending the same request
  twice is safe: one review per user per site.
- All six criteria are required (1-5). The overall `rating` is their rounded average.
- Body limit: 32 KiB. `Content-Type` must be `application/json`.

**Media limitation:** the portal cannot upload files in this version. `media`
may only reference files that the same user already uploaded to the TCDSS
`review-media` bucket through the TCDSS upload flow. The server checks that
each file exists, has the declared type and size limits, and belongs to the
caller. Otherwise it returns `422 invalid_media` or `403`. Send `"media": []`
unless you integrate with that flow. A portal upload endpoint is an open question.

## 5. Status codes

| Status | `code` | Meaning / portal action |
|---|---|---|
| 200 / 201 | – | Success. |
| 304 | – | Your cached copy (`If-None-Match`) is current. Reuse it. |
| 400 | `bad_request`, `invalid_json` | Fix the query string or JSON. Unknown query parameters are rejected. |
| 401 | `unauthenticated` | Missing, malformed or expired token. Refresh it, then retry once. |
| 403 | `origin_not_allowed` | Your browser origin is not in the allowlist. Ask TCDSS to add it. |
| 403 | `no_tourist_profile`, `forbidden` | The account cannot write this review. |
| 404 | `not_found` | Site is not a published Taal site (or Taal is not configured). |
| 413 | `payload_too_large` | Body is over 32 KiB. |
| 415 | `unsupported_media_type` | Send `Content-Type: application/json`. |
| 422 | `validation_failed`, `moderation_rejected`, `invalid_media` | Show `details` to the user and let them edit. Do not retry unchanged. |
| 429 | `rate_limited` | Reserved. Not emitted by TCDSS today (see section 9). Honour `Retry-After` if a CDN/WAF returns it. |
| 500 | `internal_error` | Unexpected. Retry later with backoff. |
| 503 | `dependency_unavailable` | Database or auth is temporarily unreachable. Retry after `Retry-After` seconds. |
| 503 | `maintenance` | TCDSS is in maintenance mode. Writes are disabled and GETs still work. Retry after `Retry-After`. |

## 6. Pagination and incremental sync

- `page` starts at 1 (maximum 10000). `page_size` defaults to 20. Values above 50 are clamped to 50.
- `meta.hasMore` tells you whether to fetch the next page.
- `updated_since` (ISO 8601 with timezone) returns rows whose `updated_at` is
  **at or after** that instant. The filter is inclusive, so de-duplicate by `id`.
- `sort=updated_asc` orders oldest change first (ties broken by `id`). Use it for sync.

Recommended sync loop (for each of `/heritage-sites` and `/reviews`):

1. Load `cursor` (the largest `updatedAt` you have stored; empty on the first run).
2. Request `?sort=updated_asc&page_size=50&updated_since=<cursor>`, page by page, until `hasMore` is false.
3. Upsert each item by `id`, then save the new largest `updatedAt` as `cursor`.
4. Repeat every few minutes. Faster than the 60 s CDN window gains nothing.

**Deletions are not visible in incremental sync.** A review that is hidden,
flagged or deleted, or a site that is unpublished or archived, simply stops
appearing. Run a full re-sync (no `updated_since`) periodically, for example
nightly, and drop local rows that are no longer returned.

Review writes also update the site's `averageRating` / `reviewCount`. That
changes the site's `updatedAt`, so the site is returned again by the next
sites sync.

## 7. Caching

- GET responses contain only public data that is the same for every user. They are sent with
  `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300`,
  an `ETag`, and `Vary: Origin`.
- Send `If-None-Match: <last ETag>` to get a body-less `304` when nothing changed.
- Server-side caches are invalidated immediately when a review is written on
  either platform, and within about 60 s when staff edit heritage sites.
- POST and all error responses are `Cache-Control: no-store`.

## 8. CORS

- Allowed browser origins are configured on TCDSS in
  `TAAL_PORTAL_ALLOWED_ORIGINS` (comma-separated, exact match, e.g.
  `https://taal.example.gov.ph`). There are no wildcards.
- Allowed request headers: `Authorization`, `Content-Type`. Exposed response
  headers: `ETag`, `Retry-After`. Credentials (cookies) are not allowed.
- A preflight or POST from an origin that is not listed gets `403 origin_not_allowed`. A GET from such an
  origin is served without CORS headers, so the browser blocks it.
- Server-to-server calls (no `Origin` header) are not subject to CORS.

## 9. Maintenance mode and rate limiting

- When TCDSS maintenance mode is on (`system_settings.global_settings.maintenanceMode`),
  `POST /reviews` returns `503 maintenance` with `Retry-After: 300`. GETs keep working.
- TCDSS does not rate-limit this API in application code. An in-memory limiter is
  unreliable across serverless instances, and no shared store is available.
  Rate limiting must be configured at the platform level (CDN/WAF in front of
  TCDSS). Hard caps on page size, page number and body size are enforced.

## 10. Recommended portal-side fallbacks

- **Keep a local copy** of sites and reviews from the sync loop and render
  from it. If TCDSS is unreachable (`503`, timeouts, network errors), keep
  serving the last synced data and show its age.
- **Retry with backoff** on `500`/`503`/network errors: honour `Retry-After`,
  otherwise use exponential backoff with jitter (e.g. 1 s, 2 s, 4 s, ... capped at 5 min).
  Never retry `4xx` unchanged, except a single retry of `401` after refreshing the token.
- **Review submission:** keep the user's draft if the POST fails with `503`
  or a network error. Retrying is safe because of the one-review-per-site
  upsert. On `422`, show `details` next to the fields.
- **After a successful POST**, show the returned review right away (it is the
  saved version). A GET may lag by up to the 60 s CDN window.
- **Time-outs:** use a client timeout (e.g. 10 s) so a slow TCDSS does not block portal pages.

## 11. Operational prerequisites (TCDSS side)

- Apply migration `20261102000000_taal_portal_api_indexes.sql`.
- Set `TAAL_PORTAL_ALLOWED_ORIGINS` in the TCDSS deployment.
- Verify the anon role can read published reviews and published/public
  heritage sites: `select * from pg_policies where tablename in ('reviews','heritage_sites');`.
  If anon cannot read published reviews, `GET /reviews` returns an empty list.
