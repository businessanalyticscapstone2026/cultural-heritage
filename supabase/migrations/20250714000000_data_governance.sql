-- Data Governance: governance_reviews table for submission/review workflow

-- 1. Create governance_reviews table
CREATE TABLE IF NOT EXISTS public.governance_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  heritage_site_id uuid NOT NULL,
  heritage_site_version_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status = ANY (ARRAY['submitted'::text, 'approved'::text, 'rejected'::text, 'archived'::text])),
  submitted_by uuid NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  reviewer_comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT governance_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT governance_reviews_heritage_site_id_fkey FOREIGN KEY (heritage_site_id) REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  CONSTRAINT governance_reviews_heritage_site_version_id_fkey FOREIGN KEY (heritage_site_version_id) REFERENCES public.heritage_site_versions(id) ON DELETE RESTRICT,
  CONSTRAINT governance_reviews_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.staff_profiles(id),
  CONSTRAINT governance_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.staff_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_governance_reviews_site_id ON public.governance_reviews(heritage_site_id);
CREATE INDEX IF NOT EXISTS idx_governance_reviews_status ON public.governance_reviews(status);
CREATE INDEX IF NOT EXISTS idx_governance_reviews_submitted_at ON public.governance_reviews(submitted_at DESC);

-- 2. Auto-update updated_at trigger for governance_reviews
CREATE OR REPLACE FUNCTION public.update_governance_review_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS governance_review_updated_at_trigger ON public.governance_reviews;
CREATE TRIGGER governance_review_updated_at_trigger
  BEFORE UPDATE ON public.governance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_governance_review_timestamp();

-- 3. Enable Row Level Security
ALTER TABLE public.governance_reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- PTCAO admin can do everything on governance reviews
CREATE POLICY "PTCAO admin can manage governance reviews"
  ON public.governance_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- MTO staff can read reviews for their municipality's heritage sites
CREATE POLICY "MTO staff can view own municipality governance reviews"
  ON public.governance_reviews FOR SELECT
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

-- MTO staff can insert reviews (submit for review)
CREATE POLICY "MTO staff can submit governance reviews"
  ON public.governance_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.id = auth.uid()
        AND submitted_by = auth.uid()
    )
  );

-- MTO staff can update reviews for their municipality (resubmit after rejection)
CREATE POLICY "MTO staff can update own municipality governance reviews"
  ON public.governance_reviews FOR UPDATE
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
