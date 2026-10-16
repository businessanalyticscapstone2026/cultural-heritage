-- Add DELETE policies for the remaining dependent tables that block a permanent
-- delete of an archived heritage site. Every FK into heritage_sites is NO ACTION,
-- so deleteSiteDependencies must explicitly remove child rows first; these DELETE
-- policies let the current user's RLS permit those explicit deletes.
--
-- RLS state notes:
--   * qr_codes and review_reports already have RLS enabled (see earlier migrations).
--   * qr_scan_logs, bookmarks, reviews, tourist_visits, and site_distances were
--     created outside the migration files, so their live RLS state is unknown.
--     We deliberately do NOT run ENABLE ROW LEVEL SECURITY on them here: if RLS is
--     already on, these policies take effect; if it is off, they are inert and the
--     deletes proceed anyway. Existing reads/writes (public review read, tourist
--     bookmark/insert, QR scan logging) are untouched.

-- ---------------------------------------------------------------------------
-- 1. qr_codes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete own municipality QR codes" ON public.qr_codes;
CREATE POLICY "MTO staff can delete own municipality QR codes"
  ON public.qr_codes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = qr_codes.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete QR codes" ON public.qr_codes;
CREATE POLICY "PTCAO admin can delete QR codes"
  ON public.qr_codes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- ---------------------------------------------------------------------------
-- 2. qr_scan_logs (child of qr_codes)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete QR scan logs for own municipality" ON public.qr_scan_logs;
CREATE POLICY "MTO staff can delete QR scan logs for own municipality"
  ON public.qr_scan_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.qr_codes qc ON qc.id = qr_scan_logs.qr_code_id
      JOIN public.heritage_sites hs ON hs.id = qc.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete QR scan logs" ON public.qr_scan_logs;
CREATE POLICY "PTCAO admin can delete QR scan logs"
  ON public.qr_scan_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. bookmarks
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete bookmarks for own municipality" ON public.bookmarks;
CREATE POLICY "MTO staff can delete bookmarks for own municipality"
  ON public.bookmarks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = bookmarks.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete bookmarks" ON public.bookmarks;
CREATE POLICY "PTCAO admin can delete bookmarks"
  ON public.bookmarks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. reviews
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete reviews for own municipality" ON public.reviews;
CREATE POLICY "MTO staff can delete reviews for own municipality"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = reviews.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete reviews" ON public.reviews;
CREATE POLICY "PTCAO admin can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- ---------------------------------------------------------------------------
-- 5. review_reports (child of reviews)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete review reports for own municipality" ON public.review_reports;
CREATE POLICY "MTO staff can delete review reports for own municipality"
  ON public.review_reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.reviews rv ON rv.id = review_reports.review_id
      JOIN public.heritage_sites hs ON hs.id = rv.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete review reports" ON public.review_reports;
CREATE POLICY "PTCAO admin can delete review reports"
  ON public.review_reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- ---------------------------------------------------------------------------
-- 6. tourist_visits
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete tourist visits for own municipality" ON public.tourist_visits;
CREATE POLICY "MTO staff can delete tourist visits for own municipality"
  ON public.tourist_visits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = tourist_visits.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete tourist visits" ON public.tourist_visits;
CREATE POLICY "PTCAO admin can delete tourist visits"
  ON public.tourist_visits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- ---------------------------------------------------------------------------
-- 7. site_distances (two FKs into heritage_sites)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "MTO staff can delete site distances for own municipality" ON public.site_distances;
CREATE POLICY "MTO staff can delete site distances for own municipality"
  ON public.site_distances FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs
        ON hs.id IN (site_distances.site_a_id, site_distances.site_b_id)
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can delete site distances" ON public.site_distances;
CREATE POLICY "PTCAO admin can delete site distances"
  ON public.site_distances FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );
