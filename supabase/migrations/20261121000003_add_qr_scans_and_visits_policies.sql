-- Migration: Add RLS INSERT and SELECT policies for qr_scan_logs and tourist_visits

-- ============================================================================
-- 1. qr_scan_logs
-- ============================================================================

-- Allow public and authenticated tourists to record QR code scans
DROP POLICY IF EXISTS "Public can insert QR scan logs" ON public.qr_scan_logs;
CREATE POLICY "Public can insert QR scan logs"
  ON public.qr_scan_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow MTO staff to view scan logs for QR codes belonging to their municipality's sites
DROP POLICY IF EXISTS "MTO staff can view QR scan logs for own municipality" ON public.qr_scan_logs;
CREATE POLICY "MTO staff can view QR scan logs for own municipality"
  ON public.qr_scan_logs FOR SELECT
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

-- Allow PTCAO admin to view all scan logs
DROP POLICY IF EXISTS "PTCAO admin can view all QR scan logs" ON public.qr_scan_logs;
CREATE POLICY "PTCAO admin can view all QR scan logs"
  ON public.qr_scan_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid()
        AND r.name != 'MTO Staff'
    )
  );

-- ============================================================================
-- 2. tourist_visits
-- ============================================================================

-- Allow public and authenticated tourists to record site visits
DROP POLICY IF EXISTS "Public can insert tourist visits" ON public.tourist_visits;
CREATE POLICY "Public can insert tourist visits"
  ON public.tourist_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow MTO staff to view visits for their municipality's heritage sites
DROP POLICY IF EXISTS "MTO staff can view tourist visits for own municipality" ON public.tourist_visits;
CREATE POLICY "MTO staff can view tourist visits for own municipality"
  ON public.tourist_visits FOR SELECT
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

-- Allow PTCAO admin to view all tourist visits
DROP POLICY IF EXISTS "PTCAO admin can view all tourist visits" ON public.tourist_visits;
CREATE POLICY "PTCAO admin can view all tourist visits"
  ON public.tourist_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid()
        AND r.name != 'MTO Staff'
    )
  );
