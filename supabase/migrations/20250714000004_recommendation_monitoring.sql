-- Recommendation Monitoring: extend recommendations table
-- Adds municipality_id (denormalized for fast scoped queries), bookmarked, bookmarked_at

-- 1. Add new columns
ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS municipality_id uuid,
  ADD COLUMN IF NOT EXISTS bookmarked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bookmarked_at timestamp with time zone;

-- 2. Backfill municipality_id from heritage_sites
UPDATE public.recommendations r
SET municipality_id = hs.municipality_id
FROM public.heritage_sites hs
WHERE r.site_id = hs.id
  AND r.municipality_id IS NULL;

-- 3. Add foreign key and make NOT NULL after backfill
ALTER TABLE public.recommendations
  ALTER COLUMN municipality_id SET NOT NULL;

ALTER TABLE public.recommendations
  ADD CONSTRAINT recommendations_municipality_id_fkey
  FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id);

-- 4. Index for fast per-municipality, per-period queries
CREATE INDEX IF NOT EXISTS idx_recommendations_municipality_generated
  ON public.recommendations (municipality_id, generated_at DESC);

-- 5. Index for per-site queries
CREATE INDEX IF NOT EXISTS idx_recommendations_site_generated
  ON public.recommendations (site_id, generated_at DESC);

-- 6. RLS: ensure MTO staff can only read their own municipality's recommendations
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MTO staff read own municipality recommendations"
  ON public.recommendations
  FOR SELECT
  TO authenticated
  USING (
    municipality_id IN (
      SELECT sp.municipality_id
      FROM public.staff_profiles sp
      WHERE sp.id = auth.uid()
    )
  );

CREATE POLICY "System can insert recommendations"
  ON public.recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update recommendations"
  ON public.recommendations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
