-- Allow staff to create QR codes for their municipality's heritage sites.
-- The qr_codes table was created via the Dashboard with read policies only, so
-- generateQrCode() was blocked by RLS: "new row violates row-level security policy".

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 1. MTO staff can insert QR codes for their municipality's sites
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
