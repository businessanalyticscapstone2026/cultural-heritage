-- Media Management: Add file metadata columns and primary image support
-- Also creates the heritage-media storage bucket and seeds media settings

-- 1. Add missing columns to heritage_site_media
ALTER TABLE public.heritage_site_media
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size_bytes integer,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;

-- 2. Create storage bucket for heritage media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'heritage-media',
  'heritage-media',
  true,
  104857600, -- 100 MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies: allow authenticated uploads, public reads
CREATE POLICY "Allow authenticated uploads to heritage-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'heritage-media');

CREATE POLICY "Allow public reads from heritage-media"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'heritage-media');

CREATE POLICY "Allow authenticated deletes from heritage-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'heritage-media');

-- 4. Seed media settings into system_settings
INSERT INTO public.system_settings (key, value)
VALUES
  ('media_allowed_image_types', '["image/jpeg", "image/png"]'::jsonb),
  ('media_allowed_document_types', '["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]'::jsonb),
  ('media_allowed_video_types', '["video/mp4", "video/quicktime"]'::jsonb),
  ('media_max_image_bytes', '10485760'::jsonb),   -- 10 MB
  ('media_max_document_bytes', '10485760'::jsonb), -- 10 MB
  ('media_max_video_bytes', '104857600'::jsonb)    -- 100 MB
ON CONFLICT (key) DO NOTHING;
