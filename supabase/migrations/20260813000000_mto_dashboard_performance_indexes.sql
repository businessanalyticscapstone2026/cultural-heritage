-- Indexes for columns the MTO dashboard filters on frequently.
-- All additive (IF NOT EXISTS), safe to run regardless of current index state.

CREATE INDEX IF NOT EXISTS idx_heritage_sites_municipality_id
  ON public.heritage_sites (municipality_id);

CREATE INDEX IF NOT EXISTS idx_qr_codes_site_id
  ON public.qr_codes (site_id);

CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_qr_code_id
  ON public.qr_scan_logs (qr_code_id);

CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scanned_at
  ON public.qr_scan_logs (scanned_at);

CREATE INDEX IF NOT EXISTS idx_tourist_visits_site_id
  ON public.tourist_visits (site_id);

CREATE INDEX IF NOT EXISTS idx_tourist_visits_visit_date
  ON public.tourist_visits (visit_date);

CREATE INDEX IF NOT EXISTS idx_bookmarks_site_id
  ON public.bookmarks (site_id);

CREATE INDEX IF NOT EXISTS idx_reviews_site_id
  ON public.reviews (site_id);

-- getMTODashboardStats / getMTOVisitsOverview filter recommendations by
-- municipality_id + was_clicked + clicked_at directly (see
-- features/mto-dashboard/services/index.ts) instead of resolving site ids
-- first, so index the combination they actually query.
CREATE INDEX IF NOT EXISTS idx_recommendations_municipality_clicked
  ON public.recommendations (municipality_id, was_clicked, clicked_at);
