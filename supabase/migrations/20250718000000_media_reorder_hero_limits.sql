-- Media Reorder, Hero Image Control, and Per-Site Limits

-- 1. Add sort_order column to heritage_site_media
ALTER TABLE public.heritage_site_media
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Backfill sort_order from created_at ordering per site
UPDATE public.heritage_site_media m
SET sort_order = sub.rnk
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY created_at ASC) - 1 AS rnk
  FROM public.heritage_site_media
) sub
WHERE m.id = sub.id;

-- 2. Seed system_settings for per-site limits
INSERT INTO public.system_settings (key, value) VALUES
  ('max_media_images_per_site', '20'),
  ('max_media_documents_per_site', '5'),
  ('max_media_videos_per_site', '3')
ON CONFLICT (key) DO NOTHING;
