-- Add is_curated column to routes table for pre-defined system heritage trails
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS is_curated boolean NOT NULL DEFAULT false;

-- Index for querying curated routes efficiently
CREATE INDEX IF NOT EXISTS idx_routes_is_curated ON public.routes(is_curated);

-- Update existing seed routes to be curated
UPDATE public.routes SET is_curated = true WHERE name IN ('Taal Heritage Walk', 'Balayan Heritage Tour');
