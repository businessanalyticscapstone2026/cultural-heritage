-- Onboarding Preferences: travel style, group type, accessibility needs
-- Extends tourist_profiles with structured preference fields

-- 1. Add new columns
ALTER TABLE public.tourist_profiles
  ADD COLUMN IF NOT EXISTS travel_style text,
  ADD COLUMN IF NOT EXISTS group_type text,
  ADD COLUMN IF NOT EXISTS accessibility_needs text[];

-- 2. Index for recommendation filtering by travel style
CREATE INDEX IF NOT EXISTS idx_tourist_profiles_travel_style
  ON public.tourist_profiles (travel_style)
  WHERE travel_style IS NOT NULL;
