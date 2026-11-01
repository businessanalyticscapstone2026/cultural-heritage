-- CHT-135: Shopee-style rich reviews.
--
-- Adds multi-criteria ratings, quick-feedback tags, review media and an
-- anonymous flag to tourist reviews, plus one SECURITY INVOKER function that
-- performs the whole multi-table review write atomically.
--
-- Compatibility:
--   * reviews.rating stays the OVERALL 1-5 integer rating. For rich reviews it is
--     derived inside submit_review() as round(avg(criteria scores)), so the
--     update_site_review_aggregates trigger, heritage_sites.average_rating /
--     review_count and every existing reader keep working unchanged.
--   * Legacy reviews have no criteria/tag/media rows; readers fall back to rating.
--   * The existing reviews RLS policies and aggregate trigger are NOT modified.
--
-- Site deletion (see 20250801000002 / 20260915000000): every new child table
-- references reviews(id) ON DELETE CASCADE. deleteSiteDependencies already
-- deletes a site's reviews explicitly; the cascade removes their criteria, tags
-- and media rows. FK cascades are executed by referential-integrity triggers and
-- are not subject to RLS, so the staff DELETE policies below are not required for
-- site deletion; they mirror the existing pattern for direct moderation deletes.

-- ---------------------------------------------------------------------------
-- 1. reviews: anonymous flag + index for the DSS access pattern
-- ---------------------------------------------------------------------------
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS reviews_site_status_updated_idx
  ON public.reviews (site_id, status, updated_at DESC);

-- ---------------------------------------------------------------------------
-- 2. review_criteria_ratings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_criteria_ratings (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  criterion_key text NOT NULL CHECK (criterion_key ~ '^[a-z][a-z_]{0,39}$'),
  score smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_criteria_ratings_pkey PRIMARY KEY (review_id, criterion_key)
);

-- ---------------------------------------------------------------------------
-- 3. review_tags
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_tags (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  tag_key text NOT NULL CHECK (tag_key ~ '^[a-z][a-z_]{0,39}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_tags_pkey PRIMARY KEY (review_id, tag_key)
);

CREATE INDEX IF NOT EXISTS review_tags_tag_key_idx ON public.review_tags (tag_key);

-- ---------------------------------------------------------------------------
-- 4. review_media
-- ---------------------------------------------------------------------------
-- storage_path is a random "<uuid>/<uuid>.<ext>" object name in the review-media
-- bucket. It never contains the reviewer's id, so public URLs cannot
-- de-anonymize an anonymous review. Ownership is tracked by review_media ->
-- reviews.tourist_id and by storage.objects.owner_id.
CREATE TABLE IF NOT EXISTS public.review_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  file_url text NOT NULL,
  storage_path text NOT NULL
    CHECK (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|mp4|mov)$'),
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  mime_type text NOT NULL,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_media_pkey PRIMARY KEY (id),
  CONSTRAINT review_media_storage_path_key UNIQUE (storage_path),
  -- file_url must be the public URL of storage_path in the review-media bucket
  CONSTRAINT review_media_file_url_matches_path
    CHECK (file_url LIKE '%/storage/v1/object/public/review-media/' || storage_path)
);

CREATE INDEX IF NOT EXISTS review_media_review_sort_idx
  ON public.review_media (review_id, sort_order);

-- ---------------------------------------------------------------------------
-- 5. RLS on the new tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.review_criteria_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_media ENABLE ROW LEVEL SECURITY;

-- 5a. review_criteria_ratings ------------------------------------------------
DROP POLICY IF EXISTS "Public can read criteria of published reviews" ON public.review_criteria_ratings;
CREATE POLICY "Public can read criteria of published reviews"
  ON public.review_criteria_ratings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_criteria_ratings.review_id AND r.status = 'published'
  ));

DROP POLICY IF EXISTS "Owners can read own review criteria" ON public.review_criteria_ratings;
CREATE POLICY "Owners can read own review criteria"
  ON public.review_criteria_ratings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_criteria_ratings.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can insert own review criteria" ON public.review_criteria_ratings;
CREATE POLICY "Owners can insert own review criteria"
  ON public.review_criteria_ratings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_criteria_ratings.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can update own review criteria" ON public.review_criteria_ratings;
CREATE POLICY "Owners can update own review criteria"
  ON public.review_criteria_ratings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_criteria_ratings.review_id AND r.tourist_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_criteria_ratings.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can delete own review criteria" ON public.review_criteria_ratings;
CREATE POLICY "Owners can delete own review criteria"
  ON public.review_criteria_ratings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_criteria_ratings.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "MTO staff can delete review criteria for own municipality" ON public.review_criteria_ratings;
CREATE POLICY "MTO staff can delete review criteria for own municipality"
  ON public.review_criteria_ratings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    JOIN public.roles ro ON sp.role_id = ro.id
    JOIN public.reviews rv ON rv.id = review_criteria_ratings.review_id
    JOIN public.heritage_sites hs ON hs.id = rv.site_id
    WHERE sp.id = auth.uid()
      AND ro.name = 'MTO Staff'
      AND sp.municipality_id = hs.municipality_id
  ));

DROP POLICY IF EXISTS "PTCAO admin can delete review criteria" ON public.review_criteria_ratings;
CREATE POLICY "PTCAO admin can delete review criteria"
  ON public.review_criteria_ratings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    JOIN public.roles ro ON sp.role_id = ro.id
    WHERE sp.id = auth.uid() AND ro.name != 'MTO Staff'
  ));

-- 5b. review_tags -----------------------------------------------------------
DROP POLICY IF EXISTS "Public can read tags of published reviews" ON public.review_tags;
CREATE POLICY "Public can read tags of published reviews"
  ON public.review_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_tags.review_id AND r.status = 'published'
  ));

DROP POLICY IF EXISTS "Owners can read own review tags" ON public.review_tags;
CREATE POLICY "Owners can read own review tags"
  ON public.review_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_tags.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can insert own review tags" ON public.review_tags;
CREATE POLICY "Owners can insert own review tags"
  ON public.review_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_tags.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can update own review tags" ON public.review_tags;
CREATE POLICY "Owners can update own review tags"
  ON public.review_tags FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_tags.review_id AND r.tourist_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_tags.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can delete own review tags" ON public.review_tags;
CREATE POLICY "Owners can delete own review tags"
  ON public.review_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_tags.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "MTO staff can delete review tags for own municipality" ON public.review_tags;
CREATE POLICY "MTO staff can delete review tags for own municipality"
  ON public.review_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    JOIN public.roles ro ON sp.role_id = ro.id
    JOIN public.reviews rv ON rv.id = review_tags.review_id
    JOIN public.heritage_sites hs ON hs.id = rv.site_id
    WHERE sp.id = auth.uid()
      AND ro.name = 'MTO Staff'
      AND sp.municipality_id = hs.municipality_id
  ));

DROP POLICY IF EXISTS "PTCAO admin can delete review tags" ON public.review_tags;
CREATE POLICY "PTCAO admin can delete review tags"
  ON public.review_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    JOIN public.roles ro ON sp.role_id = ro.id
    WHERE sp.id = auth.uid() AND ro.name != 'MTO Staff'
  ));

-- 5c. review_media ----------------------------------------------------------
DROP POLICY IF EXISTS "Public can read media of published reviews" ON public.review_media;
CREATE POLICY "Public can read media of published reviews"
  ON public.review_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_media.review_id AND r.status = 'published'
  ));

DROP POLICY IF EXISTS "Owners can read own review media" ON public.review_media;
CREATE POLICY "Owners can read own review media"
  ON public.review_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_media.review_id AND r.tourist_id = auth.uid()
  ));

-- INSERT additionally requires the referenced storage object to exist in the
-- review-media bucket and be owned by the caller, so a user cannot attach
-- somebody else's upload (or an arbitrary URL) to their review.
DROP POLICY IF EXISTS "Owners can insert own review media" ON public.review_media;
CREATE POLICY "Owners can insert own review media"
  ON public.review_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_media.review_id AND r.tourist_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM storage.objects o
      WHERE o.bucket_id = 'review-media'
        AND o.name = review_media.storage_path
        AND o.owner_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Owners can update own review media" ON public.review_media;
CREATE POLICY "Owners can update own review media"
  ON public.review_media FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_media.review_id AND r.tourist_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_media.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can delete own review media" ON public.review_media;
CREATE POLICY "Owners can delete own review media"
  ON public.review_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_media.review_id AND r.tourist_id = auth.uid()
  ));

DROP POLICY IF EXISTS "MTO staff can delete review media for own municipality" ON public.review_media;
CREATE POLICY "MTO staff can delete review media for own municipality"
  ON public.review_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    JOIN public.roles ro ON sp.role_id = ro.id
    JOIN public.reviews rv ON rv.id = review_media.review_id
    JOIN public.heritage_sites hs ON hs.id = rv.site_id
    WHERE sp.id = auth.uid()
      AND ro.name = 'MTO Staff'
      AND sp.municipality_id = hs.municipality_id
  ));

DROP POLICY IF EXISTS "PTCAO admin can delete review media" ON public.review_media;
CREATE POLICY "PTCAO admin can delete review media"
  ON public.review_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    JOIN public.roles ro ON sp.role_id = ro.id
    WHERE sp.id = auth.uid() AND ro.name != 'MTO Staff'
  ));

-- ---------------------------------------------------------------------------
-- 6. Storage bucket: review-media
-- ---------------------------------------------------------------------------
-- Bucket-level limits are defense in depth: the largest allowed file (30 MB
-- video) and the union of allowed MIME types. Per-type limits (5 MB images,
-- 30 MB video, counts) are enforced by the server (features/reviews/constants.ts).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-media',
  'review-media',
  true,
  31457280,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Object names are "<random uuid>/<random uuid>.<ext>" and never include the
-- user's id (anonymity). "Own prefix" is therefore enforced via the object
-- owner (storage sets owner_id = auth.uid() on upload) instead of a path prefix.
DROP POLICY IF EXISTS "Tourists can upload own review media" ON storage.objects;
CREATE POLICY "Tourists can upload own review media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'review-media'
    AND owner_id = auth.uid()::text
    AND name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|mp4|mov)$'
  );

-- Owners can read object metadata (needed for server-side size/MIME
-- verification and the review_media INSERT check). Public file reads go through
-- the public bucket URL and do not need a SELECT policy.
DROP POLICY IF EXISTS "Owners can read own review media objects" ON storage.objects;
CREATE POLICY "Owners can read own review media objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'review-media' AND owner_id = auth.uid()::text);

DROP POLICY IF EXISTS "Owners can delete own review media objects" ON storage.objects;
CREATE POLICY "Owners can delete own review media objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'review-media' AND owner_id = auth.uid()::text);
-- No UPDATE policy: uploaded objects cannot be overwritten after verification.

-- ---------------------------------------------------------------------------
-- 7. submit_review(): atomic multi-table review write
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER: every statement runs under the caller's RLS policies.
-- Upserts on (tourist_id, site_id) for the caller (auth.uid()).
--
-- Parameters:
--   p_criteria      jsonb object {criterion_key: score}. Non-empty: rich review,
--                   rating = round(avg(score)). Empty '{}': rating-only review
--                   (legacy feedback form) using p_rating; existing criteria rows
--                   are cleared because they would contradict the new rating.
--   p_rating        overall rating, used only when p_criteria is empty.
--   p_comment       comment text (NULL/blank stored as NULL).
--   p_is_anonymous  NULL keeps the current value (false for new reviews).
--   p_tags          NULL keeps current tags; an array replaces them.
--   p_media         NULL keeps current media; a jsonb array is the desired final
--                   media set: [{storage_path, media_type, file_url, file_name,
--                   file_size_bytes, mime_type, sort_order}]. Rows whose
--                   storage_path is absent are deleted and their paths returned
--                   so the caller can remove the storage objects.
--
-- Returns jsonb {review_id uuid, removed_storage_paths text[]}.
--
-- NOTE: matching the pre-existing createReview behavior, an edit sets status to
-- 'published' (this re-publishes flagged/hidden reviews; reported in CHT-135).
CREATE OR REPLACE FUNCTION public.submit_review(
  p_site_id uuid,
  p_criteria jsonb,
  p_rating smallint,
  p_comment text,
  p_is_anonymous boolean,
  p_tags text[],
  p_media jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rating smallint;
  v_review_id uuid;
  v_removed text[] := ARRAY[]::text[];
  v_bad_score_count int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_criteria IS NULL OR jsonb_typeof(p_criteria) <> 'object' THEN
    RAISE EXCEPTION 'invalid_criteria' USING ERRCODE = '22023';
  END IF;

  IF p_criteria = '{}'::jsonb THEN
    IF p_rating IS NULL OR p_rating NOT BETWEEN 1 AND 5 THEN
      RAISE EXCEPTION 'invalid_rating' USING ERRCODE = '22023';
    END IF;
    v_rating := p_rating;
  ELSE
    SELECT count(*) INTO v_bad_score_count
    FROM jsonb_each(p_criteria) AS c(key, value)
    WHERE jsonb_typeof(c.value) <> 'number'
       OR (c.value)::text !~ '^[1-5]$';
    IF v_bad_score_count > 0 THEN
      RAISE EXCEPTION 'invalid_criteria' USING ERRCODE = '22023';
    END IF;

    SELECT round(avg((c.value)::text::numeric))::smallint INTO v_rating
    FROM jsonb_each(p_criteria) AS c(key, value);
  END IF;

  IF p_media IS NOT NULL AND jsonb_typeof(p_media) <> 'array' THEN
    RAISE EXCEPTION 'invalid_media' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.reviews (tourist_id, site_id, rating, comment, is_anonymous, status)
  VALUES (
    v_uid,
    p_site_id,
    v_rating,
    NULLIF(btrim(p_comment), ''),
    COALESCE(p_is_anonymous, false),
    'published'
  )
  ON CONFLICT (tourist_id, site_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    is_anonymous = COALESCE(p_is_anonymous, public.reviews.is_anonymous),
    status = 'published',
    updated_at = now()
  RETURNING id INTO v_review_id;

  -- Criteria: always replaced (rating-only reviews clear stale criteria).
  DELETE FROM public.review_criteria_ratings WHERE review_id = v_review_id;
  INSERT INTO public.review_criteria_ratings (review_id, criterion_key, score)
  SELECT v_review_id, c.key, (c.value)::text::smallint
  FROM jsonb_each(p_criteria) AS c(key, value);

  IF p_tags IS NOT NULL THEN
    DELETE FROM public.review_tags WHERE review_id = v_review_id;
    INSERT INTO public.review_tags (review_id, tag_key)
    SELECT DISTINCT v_review_id, t FROM unnest(p_tags) AS t;
  END IF;

  IF p_media IS NOT NULL THEN
    WITH desired AS (
      SELECT m->>'storage_path' AS storage_path FROM jsonb_array_elements(p_media) AS m
    ), removed AS (
      DELETE FROM public.review_media rm
      WHERE rm.review_id = v_review_id
        AND rm.storage_path NOT IN (SELECT storage_path FROM desired)
      RETURNING rm.storage_path
    )
    SELECT COALESCE(array_agg(storage_path), ARRAY[]::text[]) INTO v_removed FROM removed;

    -- Keep sort order of retained media in sync with the submitted order.
    UPDATE public.review_media rm
    SET sort_order = (m->>'sort_order')::smallint, updated_at = now()
    FROM jsonb_array_elements(p_media) AS m
    WHERE rm.review_id = v_review_id
      AND rm.storage_path = m->>'storage_path';

    INSERT INTO public.review_media (
      review_id, media_type, file_url, storage_path, file_name,
      file_size_bytes, mime_type, sort_order
    )
    SELECT
      v_review_id,
      m->>'media_type',
      m->>'file_url',
      m->>'storage_path',
      m->>'file_name',
      (m->>'file_size_bytes')::bigint,
      m->>'mime_type',
      (m->>'sort_order')::smallint
    FROM jsonb_array_elements(p_media) AS m
    WHERE NOT EXISTS (
      SELECT 1 FROM public.review_media rm
      WHERE rm.review_id = v_review_id AND rm.storage_path = m->>'storage_path'
    );
  END IF;

  RETURN jsonb_build_object(
    'review_id', v_review_id,
    'removed_storage_paths', to_jsonb(v_removed)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_review(uuid, jsonb, smallint, text, boolean, text[], jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.submit_review(uuid, jsonb, smallint, text, boolean, text[], jsonb) TO authenticated;
