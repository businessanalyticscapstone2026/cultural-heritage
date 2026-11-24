-- Documented heritage inventory per municipality (capstone paper, Table 4.1).
-- Encoded count stays live from heritage_sites; this is the reference denominator.
-- RLS: column inherits existing municipalities policies (public read, super_admin write).
ALTER TABLE public.municipalities
  ADD COLUMN IF NOT EXISTS documented_site_count integer
    CHECK (documented_site_count IS NULL OR documented_site_count >= 0);

COMMENT ON COLUMN public.municipalities.documented_site_count IS
  'Documented inventory count from paper Table 4.1. NULL = unknown.';

-- Paper lists "Calaca City"; the municipalities row is named "Calaca".
UPDATE public.municipalities AS m
SET documented_site_count = v.n, updated_at = now()
FROM (VALUES
  ('Balayan', 8), ('Calaca', 3), ('Calatagan', 4), ('Lemery', 4),
  ('Lian', 4), ('Nasugbu', 6), ('Taal', 147), ('Tuy', 4)
) AS v(name, n)
WHERE m.name = v.name;
