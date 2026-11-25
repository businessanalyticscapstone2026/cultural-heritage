-- Add age_group to tourist_profiles for demographic analytics
ALTER TABLE public.tourist_profiles 
ADD COLUMN IF NOT EXISTS age_group text 
CHECK (age_group IS NULL OR age_group IN ('18-24', '25-34', '35-54', '55+'));

COMMENT ON COLUMN public.tourist_profiles.age_group IS 'Age bracket of the tourist for aggregate analytics (18-24, 25-34, 35-54, 55+)';

-- Backfill any existing tourist_visits without an age group to the default '18-24'
UPDATE public.tourist_visits
SET age_group = '18-24'
WHERE age_group IS NULL;
