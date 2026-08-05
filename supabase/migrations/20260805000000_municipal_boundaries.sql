-- Municipal Boundaries: store GIS boundary polygons per municipality
--
-- PostGIS is not enabled on this project (no `CREATE EXTENSION postgis` in any
-- prior migration, and no geometry/geography/ST_* usage anywhere in the
-- codebase — all existing coordinate data, e.g. municipalities.default_map_center,
-- is stored as plain jsonb). Boundaries are therefore stored as a GeoJSON
-- Feature in jsonb rather than a native `geometry` column.
--
-- One active boundary per municipality: re-uploading a boundary overwrites the
-- existing row (UNIQUE municipality_id) rather than versioning it. No existing
-- table in this codebase versions full row history (municipality_audit_log
-- only tracks field-level changes to `municipalities`, not full snapshots).

-- 1. Create municipal_boundaries table
CREATE TABLE IF NOT EXISTS public.municipal_boundaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  municipality_id uuid NOT NULL,
  boundary_geojson jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT municipal_boundaries_pkey PRIMARY KEY (id),
  CONSTRAINT municipal_boundaries_municipality_id_key UNIQUE (municipality_id),
  CONSTRAINT municipal_boundaries_municipality_id_fkey FOREIGN KEY (municipality_id)
    REFERENCES public.municipalities(id) ON DELETE CASCADE,
  CONSTRAINT municipal_boundaries_geojson_type_check CHECK (
    boundary_geojson ->> 'type' = 'Feature'
    AND (boundary_geojson -> 'geometry' ->> 'type') IN ('Polygon', 'MultiPolygon')
  )
);

-- 2. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_municipal_boundary_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_municipal_boundary_updated_at ON public.municipal_boundaries;
CREATE TRIGGER set_municipal_boundary_updated_at
  BEFORE UPDATE ON public.municipal_boundaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_municipal_boundary_updated_at();

-- 3. Enable RLS
ALTER TABLE public.municipal_boundaries ENABLE ROW LEVEL SECURITY;

-- 4. Public can view boundaries of active municipalities (reference data for map rendering)
CREATE POLICY "Public can view boundaries of active municipalities"
  ON public.municipal_boundaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.municipalities m
      WHERE m.id = municipal_boundaries.municipality_id AND m.status = 'active'
    )
  );

-- 5. Staff can view all boundaries
CREATE POLICY "Staff can view all boundaries"
  ON public.municipal_boundaries FOR SELECT
  USING (public.get_user_role_name() IS NOT NULL);

-- 6. PTCAO admin (any role except MTO Staff) can manage boundaries
CREATE POLICY "PTCAO admin can manage boundaries"
  ON public.municipal_boundaries FOR ALL
  USING (public.get_user_role_name() != 'MTO Staff')
  WITH CHECK (public.get_user_role_name() != 'MTO Staff');
