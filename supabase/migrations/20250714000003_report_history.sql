CREATE TABLE IF NOT EXISTS public.generated_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  municipality_id uuid NOT NULL,
  report_type text NOT NULL,
  report_title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT generated_reports_pkey PRIMARY KEY (id),
  CONSTRAINT generated_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT generated_reports_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE
);

ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.generated_reports FOR DELETE
  USING (auth.uid() = user_id);
