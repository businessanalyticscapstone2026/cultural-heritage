-- REVIEW REQUIRED: This migration adds an `announcements` table to support
-- the tourist-facing home page "What's happening in the district" section.
-- It has NOT been reviewed or applied yet.
--
-- If you accept this migration, run:
--   supabase migration up
--
-- If you reject it, delete this file and remove the
-- AnnouncementsSection component from app/page.tsx.
--
-- CHT-092: added `category` (e.g. Festival, Event, Announcement) and
-- `link_url` (external detail target for the "Learn more" action).

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  category text,
  image_url text,
  link_url text,
  event_date date,
  municipality_id uuid,
  published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_municipality_id_fkey
    FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id),
  CONSTRAINT announcements_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.staff_profiles(id)
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements are public for published rows"
  ON public.announcements
  FOR SELECT
  USING (published = true);

CREATE POLICY "Staff can insert announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can update their own announcements"
  ON public.announcements
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
