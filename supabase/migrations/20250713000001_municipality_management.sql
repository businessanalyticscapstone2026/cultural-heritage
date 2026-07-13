-- Municipality Management: Add status, map center, and audit logging
-- Extends the existing municipalities table and creates municipality_audit_log

-- 1. Add new columns to municipalities
ALTER TABLE public.municipalities
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text])),
  ADD COLUMN IF NOT EXISTS default_map_center jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- 2. Drop the type column (all 8 are municipalities, no city distinction needed)
ALTER TABLE public.municipalities
  DROP COLUMN IF EXISTS type;

-- 3. Create municipality_audit_log table
CREATE TABLE IF NOT EXISTS public.municipality_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  municipality_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['created'::text, 'status_changed'::text, 'updated'::text])),
  performed_by uuid,
  previous_value jsonb,
  new_value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT municipality_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT municipality_audit_log_municipality_id_fkey FOREIGN KEY (municipality_id)
    REFERENCES public.municipalities(id) ON DELETE CASCADE,
  CONSTRAINT municipality_audit_log_performed_by_fkey FOREIGN KEY (performed_by)
    REFERENCES public.staff_profiles(id)
);

-- 4. Create index for efficient audit log queries
CREATE INDEX IF NOT EXISTS idx_municipality_audit_log_municipality_id
  ON public.municipality_audit_log (municipality_id, created_at DESC);

-- 5. Seed the 8 First District municipalities with active status and default map centers
INSERT INTO public.municipalities (name, province, status, default_map_center) VALUES
  ('Nasugbu',     'Batangas', 'active', '{"lat": 14.0677, "long": 120.6278}'::jsonb),
  ('Lian',        'Batangas', 'active', '{"lat": 14.0067, "long": 120.6417}'::jsonb),
  ('Tuy',         'Batangas', 'active', '{"lat": 14.0167, "long": 120.6833}'::jsonb),
  ('Balayan',     'Batangas', 'active', '{"lat": 13.9372, "long": 120.6914}'::jsonb),
  ('Calaca',      'Batangas', 'active', '{"lat": 13.96,    "long": 120.61}'::jsonb),
  ('Lemery',      'Batangas', 'active', '{"lat": 13.8833, "long": 120.5667}'::jsonb),
  ('Taal',        'Batangas', 'active', '{"lat": 13.8833, "long": 120.9239}'::jsonb),
  ('Calatagan',   'Batangas', 'active', '{"lat": 13.8322, "long": 120.6328}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  status = EXCLUDED.status,
  default_map_center = EXCLUDED.default_map_center,
  updated_at = now();

-- 6. Create trigger to auto-update updated_at on municipalities
CREATE OR REPLACE FUNCTION public.update_municipality_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_municipality_updated_at ON public.municipalities;
CREATE TRIGGER set_municipality_updated_at
  BEFORE UPDATE ON public.municipalities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_municipality_updated_at();
