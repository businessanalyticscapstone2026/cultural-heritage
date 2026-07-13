-- Migration: Create review_reports table

CREATE TABLE IF NOT EXISTS public.review_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL,
  reported_by uuid NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT review_reports_pkey PRIMARY KEY (id),
  CONSTRAINT review_reports_review_id_fkey FOREIGN KEY (review_id)
    REFERENCES public.reviews(id) ON DELETE CASCADE,
  CONSTRAINT review_reports_reported_by_fkey FOREIGN KEY (reported_by)
    REFERENCES public.tourist_profiles(id),
  CONSTRAINT review_reports_review_reporter_unique UNIQUE (review_id, reported_by)
);

-- RLS: users can only read their own reports
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tourists can insert their own reports"
  ON public.review_reports FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Tourists can read their own reports"
  ON public.review_reports FOR SELECT
  TO authenticated
  USING (reported_by = auth.uid());
