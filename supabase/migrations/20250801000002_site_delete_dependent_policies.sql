-- Allow staff to permanently delete archived heritage sites that are referenced by
-- NO ACTION foreign keys. These dependents cannot rely on ON DELETE CASCADE, so the
-- app must delete them explicitly first (see deleteSiteDependencies). These DELETE
-- policies let the current user's RLS permit those explicit deletes.

-- 1. Ensure RLS is enabled on dependent tables
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- 2. MTO staff can delete recommendations for their municipality's sites
CREATE POLICY "MTO staff can delete own municipality recommendations"
  ON public.recommendations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = recommendations.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 3. PTCAO admin can delete recommendations
CREATE POLICY "PTCAO admin can delete recommendations"
  ON public.recommendations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- 4. MTO staff can delete route stops for their municipality's sites
CREATE POLICY "MTO staff can delete own municipality route stops"
  ON public.route_stops FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = route_stops.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 5. PTCAO admin can delete route stops
CREATE POLICY "PTCAO admin can delete route stops"
  ON public.route_stops FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );
