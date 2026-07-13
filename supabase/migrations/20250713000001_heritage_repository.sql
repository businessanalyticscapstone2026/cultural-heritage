-- Heritage Repository: Add missing columns, versioning table, updated_at trigger, and RLS policies

-- 1. Add missing columns to heritage_sites
ALTER TABLE public.heritage_sites ADD COLUMN IF NOT EXISTS entrance_fee text;
ALTER TABLE public.heritage_sites ADD COLUMN IF NOT EXISTS designation text;

-- 2. Create heritage_site_versions table for edit history / data governance
CREATE TABLE IF NOT EXISTS public.heritage_site_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  heritage_site_id uuid NOT NULL,
  snapshot jsonb NOT NULL,
  changed_by uuid,
  change_type text NOT NULL CHECK (change_type = ANY (ARRAY['created'::text, 'updated'::text, 'status_changed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT heritage_site_versions_pkey PRIMARY KEY (id),
  CONSTRAINT heritage_site_versions_heritage_site_id_fkey FOREIGN KEY (heritage_site_id) REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  CONSTRAINT heritage_site_versions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.staff_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_heritage_site_versions_site_id ON public.heritage_site_versions(heritage_site_id);
CREATE INDEX IF NOT EXISTS idx_heritage_site_versions_created_at ON public.heritage_site_versions(created_at DESC);

-- 3. Auto-update updated_at trigger for heritage_sites
CREATE OR REPLACE FUNCTION public.update_heritage_site_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS heritage_site_updated_at_trigger ON public.heritage_sites;
CREATE TRIGGER heritage_site_updated_at_trigger
  BEFORE UPDATE ON public.heritage_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_heritage_site_timestamp();

-- 4. Enable Row Level Security on heritage tables
ALTER TABLE public.heritage_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_site_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_site_reference_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_site_versions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- heritage_sites: Public can read published + public sites
CREATE POLICY "Public can view published heritage sites"
  ON public.heritage_sites FOR SELECT
  USING (publication_status = 'published' AND visibility = 'public');

-- heritage_sites: PTCAO admin can do everything
CREATE POLICY "PTCAO admin can manage all heritage sites"
  ON public.heritage_sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- heritage_sites: MTO staff can manage sites in their municipality
CREATE POLICY "MTO staff can manage own municipality heritage sites"
  ON public.heritage_sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = heritage_sites.municipality_id
    )
  );

-- heritage_categories: Public can read, admin/MTO can write
CREATE POLICY "Public can view heritage categories"
  ON public.heritage_categories FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage heritage categories"
  ON public.heritage_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- heritage_site_media: Public can read, authenticated can manage
CREATE POLICY "Public can view heritage site media"
  ON public.heritage_site_media FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage heritage site media"
  ON public.heritage_site_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- heritage_site_tags: Public can read, authenticated can manage
CREATE POLICY "Public can view heritage site tags"
  ON public.heritage_site_tags FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage heritage site tags"
  ON public.heritage_site_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- heritage_site_reference_links: Public can read, authenticated can manage
CREATE POLICY "Public can view heritage site reference links"
  ON public.heritage_site_reference_links FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage heritage site reference links"
  ON public.heritage_site_reference_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- heritage_site_versions: PTCAO can read all, MTO can read own municipality
CREATE POLICY "PTCAO admin can view all heritage site versions"
  ON public.heritage_site_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

CREATE POLICY "MTO staff can view own municipality heritage site versions"
  ON public.heritage_site_versions FOR SELECT
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

CREATE POLICY "Staff can insert heritage site versions"
  ON public.heritage_site_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );
