-- Fix QR code status toggles: the deployed qr_codes table carries UPDATE RLS
-- policies that reject status changes ("new row violates row-level security policy").
-- Drop every existing UPDATE policy, then recreate the canonical ones from
-- 20250801000004_qr_codes_insert_policies.sql with USING == WITH CHECK, so a
-- status toggle is permitted for the site owner.

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Remove any existing UPDATE policies so the canonical ones are authoritative.
DO $$
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'qr_codes' AND cmd = 'UPDATE'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.qr_codes', policy_record.policyname);
  END LOOP;
END $$;

-- 1. MTO staff can insert QR codes for their municipality's sites
DROP POLICY IF EXISTS "MTO staff can insert QR codes" ON public.qr_codes;
CREATE POLICY "MTO staff can insert QR codes"
  ON public.qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = qr_codes.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 2. PTCAO admin can insert QR codes for any site
DROP POLICY IF EXISTS "PTCAO admin can insert QR codes" ON public.qr_codes;
CREATE POLICY "PTCAO admin can insert QR codes"
  ON public.qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- 3. MTO staff can update QR codes for their municipality's sites (status toggles)
CREATE POLICY "MTO staff can update QR codes"
  ON public.qr_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = qr_codes.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = qr_codes.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 4. PTCAO admin can update QR codes for any site
CREATE POLICY "PTCAO admin can update QR codes"
  ON public.qr_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );
