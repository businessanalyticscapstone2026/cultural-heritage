-- Migration: Add updated_at and unique constraint to reviews table
-- Plus trigger to auto-update updated_at on edit

-- Add updated_at column
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Enforce one review per tourist per site
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_tourist_site_unique UNIQUE (tourist_id, site_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on review update
DROP TRIGGER IF EXISTS reviews_updated_at_trigger ON public.reviews;
CREATE TRIGGER reviews_updated_at_trigger
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_timestamp();
