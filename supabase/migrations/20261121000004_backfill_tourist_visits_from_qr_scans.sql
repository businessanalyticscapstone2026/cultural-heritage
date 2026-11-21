-- Migration: Add visitor_origin column and backfill tourist_visits from qr_scan_logs

-- 1. Ensure visitor_origin column exists on tourist_visits
ALTER TABLE public.tourist_visits ADD COLUMN IF NOT EXISTS visitor_origin text;

-- 2. Normalize existing visits so both visitor_type and visitor_origin are populated
UPDATE public.tourist_visits
SET 
  visitor_origin = COALESCE(visitor_type, 'domestic'),
  visitor_type = COALESCE(visitor_type, 'domestic')
WHERE visitor_origin IS NULL OR visitor_type IS NULL;

-- 3. Backfill all existing QR scan logs into tourist_visits
INSERT INTO public.tourist_visits (site_id, visit_date, visitor_type, visitor_origin, source, created_at)
SELECT 
  qc.site_id,
  DATE(qsl.scanned_at),
  'domestic',
  'domestic',
  'qr_scan',
  qsl.scanned_at
FROM public.qr_scan_logs qsl
JOIN public.qr_codes qc ON qc.id = qsl.qr_code_id
WHERE qc.site_id IS NOT NULL;
