-- CHT-136: indexes for the Taal portal API (/api/v1/taal/*).
--
-- GET /api/v1/taal/heritage-sites filters heritage_sites by municipality_id +
-- publication_status (+ visibility) and orders / filters by updated_at for
-- incremental sync (updated_since). The existing single-column
-- idx_heritage_sites_municipality_id (20260813000000) cannot serve the
-- updated_at ordering.
--
-- GET /api/v1/taal/reviews filters reviews by site_id IN (...) + status and
-- orders by updated_at. That is already covered by
-- reviews_site_status_updated_idx (site_id, status, updated_at DESC) from
-- 20261101000000_rich_reviews.sql, so no new reviews index is added.
--
-- Additive and idempotent. No data, policy or function changes.

CREATE INDEX IF NOT EXISTS idx_heritage_sites_municipality_status_updated
  ON public.heritage_sites (municipality_id, publication_status, updated_at DESC);
