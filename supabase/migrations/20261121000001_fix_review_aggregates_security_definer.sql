-- Migration: Fix review aggregate trigger with SECURITY DEFINER + backfill existing review counts

CREATE OR REPLACE FUNCTION public.update_site_review_aggregates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_site_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_site_id := OLD.site_id;
  ELSE
    target_site_id := NEW.site_id;
  END IF;

  UPDATE public.heritage_sites
  SET
    average_rating = COALESCE((
      SELECT round(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      WHERE r.site_id = target_site_id AND r.status = 'published'
    ), 0),
    review_count = (
      SELECT count(*)
      FROM public.reviews r
      WHERE r.site_id = target_site_id AND r.status = 'published'
    )
  WHERE id = target_site_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS reviews_aggregate_trigger ON public.reviews;
CREATE TRIGGER reviews_aggregate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_site_review_aggregates();

-- Backfill all heritage sites with accurate review aggregates from published reviews
UPDATE public.heritage_sites hs
SET
  average_rating = COALESCE((
    SELECT round(AVG(r.rating)::numeric, 2)
    FROM public.reviews r
    WHERE r.site_id = hs.id AND r.status = 'published'
  ), 0),
  review_count = (
    SELECT count(*)
    FROM public.reviews r
    WHERE r.site_id = hs.id AND r.status = 'published'
  );
