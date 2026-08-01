-- Allow MTO staff to permanently delete archived heritage sites.
-- governance_reviews.heritage_site_version_id is ON DELETE RESTRICT, so delete flows
-- must explicitly remove governance reviews and version snapshots first. These DELETE
-- policies let the current user's RLS permit those explicit deletes.

-- 1. MTO staff can delete governance reviews for their municipality's sites
CREATE POLICY "MTO staff can delete own municipality governance reviews"
  ON public.governance_reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = governance_reviews.heritage_site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 2. MTO staff can delete version history for their municipality's sites
CREATE POLICY "MTO staff can delete own municipality heritage site versions"
  ON public.heritage_site_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = heritage_site_versions.heritage_site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 3. PTCAO admin can delete heritage site versions
CREATE POLICY "PTCAO admin can delete heritage site versions"
  ON public.heritage_site_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );
