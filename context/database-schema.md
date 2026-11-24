-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.municipalities (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE,
province text NOT NULL DEFAULT 'Batangas'::text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text])),
default_map_center jsonb,
updated_at timestamp with time zone NOT NULL DEFAULT now(),
documented_site_count integer CHECK (documented_site_count IS NULL OR documented_site_count >= 0), -- documented inventory (paper Table 4.1); encoded count is live from heritage_sites
CONSTRAINT municipalities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.roles (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE,
description text,
status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.permissions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
module text NOT NULL,
action text NOT NULL CHECK (action = ANY (ARRAY['view'::text, 'add'::text, 'edit'::text, 'delete'::text, 'export'::text, 'approve'::text, 'manage'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.role_permissions (
role_id uuid NOT NULL,
permission_id uuid NOT NULL,
granted boolean NOT NULL DEFAULT true,
CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.staff_profiles (
id uuid NOT NULL,
first_name text,
last_name text,
username text UNIQUE,
role_id uuid,
municipality_id uuid,
account_status text NOT NULL DEFAULT 'active'::text CHECK (account_status = ANY (ARRAY['active'::text, 'inactive'::text])),
created_by uuid,
last_login timestamp with time zone,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT staff_profiles_pkey PRIMARY KEY (id),
CONSTRAINT staff_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
CONSTRAINT staff_profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
CONSTRAINT staff_profiles_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id),
CONSTRAINT staff_profiles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.tourist_profiles (
id uuid NOT NULL,
first_name text,
last_name text,
interests ARRAY,
preferred_category_ids ARRAY,
home_latitude numeric,
home_longitude numeric,
account_status text NOT NULL DEFAULT 'active'::text CHECK (account_status = ANY (ARRAY['active'::text, 'inactive'::text])),
last_login timestamp with time zone,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
onboarding_completed_at timestamp with time zone,
travel_style text,
group_type text,
accessibility_needs ARRAY,
CONSTRAINT tourist_profiles_pkey PRIMARY KEY (id),
CONSTRAINT tourist_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.heritage_categories (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE,
description text,
icon text,
color text,
display_order integer,
status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT heritage_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.heritage_sites (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_name text NOT NULL,
alternative_name text,
category_id uuid,
municipality_id uuid,
barangay text,
exact_address text,
short_description text,
detailed_description text,
historical_period text,
year_established text,
architect_builder text,
architectural_style text,
historical_significance text,
cultural_significance text,
latitude numeric,
longitude numeric,
elevation numeric,
geo_accuracy text,
accessibility_info text,
operating_hours text,
publication_status text NOT NULL DEFAULT 'draft'::text CHECK (publication_status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
is_featured boolean NOT NULL DEFAULT false,
visibility text NOT NULL DEFAULT 'public'::text,
created_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
average_rating numeric DEFAULT 0,
review_count integer DEFAULT 0,
entrance_fee text,
designation text,
CONSTRAINT heritage_sites_pkey PRIMARY KEY (id),
CONSTRAINT heritage_sites_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.heritage_categories(id),
CONSTRAINT heritage_sites_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id),
CONSTRAINT heritage_sites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.heritage_site_media (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_id uuid NOT NULL,
media_type text NOT NULL CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text, 'brochure'::text, 'document'::text])),
file_url text NOT NULL,
caption text,
uploaded_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
file_name text,
file_size_bytes integer,
mime_type text,
is_primary boolean NOT NULL DEFAULT false,
sort_order integer NOT NULL DEFAULT 0,
CONSTRAINT heritage_site_media_pkey PRIMARY KEY (id),
CONSTRAINT heritage_site_media_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id),
CONSTRAINT heritage_site_media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.heritage_site_tags (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_id uuid NOT NULL,
tag text NOT NULL,
CONSTRAINT heritage_site_tags_pkey PRIMARY KEY (id),
CONSTRAINT heritage_site_tags_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id)
);
CREATE TABLE public.heritage_site_reference_links (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_id uuid NOT NULL,
url text NOT NULL,
label text,
CONSTRAINT heritage_site_reference_links_pkey PRIMARY KEY (id),
CONSTRAINT heritage_site_reference_links_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id)
);
CREATE TABLE public.bookmarks (
id uuid NOT NULL DEFAULT gen_random_uuid(),
tourist_id uuid NOT NULL,
site_id uuid NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT bookmarks_pkey PRIMARY KEY (id),
CONSTRAINT bookmarks_tourist_id_fkey FOREIGN KEY (tourist_id) REFERENCES public.tourist_profiles(id),
CONSTRAINT bookmarks_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id)
);
CREATE TABLE public.reviews (
id uuid NOT NULL DEFAULT gen_random_uuid(),
tourist_id uuid,
site_id uuid NOT NULL,
rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
comment text,
status text NOT NULL DEFAULT 'published'::text CHECK (status = ANY (ARRAY['published'::text, 'flagged'::text, 'hidden'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
is_anonymous boolean NOT NULL DEFAULT false, -- CHT-135; hides author identity in every read path
CONSTRAINT reviews_pkey PRIMARY KEY (id),
CONSTRAINT reviews_tourist_id_fkey FOREIGN KEY (tourist_id) REFERENCES public.tourist_profiles(id),
CONSTRAINT reviews_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id)
);
CREATE TABLE public.recommendations (
id uuid NOT NULL DEFAULT gen_random_uuid(),
tourist_id uuid,
session_id text,
site_id uuid NOT NULL,
score numeric,
method text CHECK (method = ANY (ARRAY['content_based'::text, 'location_aware'::text, 'weighted_hybrid'::text])),
generated_at timestamp with time zone NOT NULL DEFAULT now(),
was_clicked boolean NOT NULL DEFAULT false,
clicked_at timestamp with time zone,
led_to_route boolean NOT NULL DEFAULT false,
municipality_id uuid NOT NULL,
bookmarked boolean NOT NULL DEFAULT false,
bookmarked_at timestamp with time zone,
CONSTRAINT recommendations_pkey PRIMARY KEY (id),
CONSTRAINT recommendations_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id),
CONSTRAINT recommendations_tourist_id_fkey FOREIGN KEY (tourist_id) REFERENCES public.tourist_profiles(id),
CONSTRAINT recommendations_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id)
);
CREATE TABLE public.site_distances (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_a_id uuid NOT NULL,
site_b_id uuid NOT NULL,
distance_km numeric NOT NULL,
travel_time_minutes integer,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT site_distances_pkey PRIMARY KEY (id),
CONSTRAINT site_distances_site_a_id_fkey FOREIGN KEY (site_a_id) REFERENCES public.heritage_sites(id),
CONSTRAINT site_distances_site_b_id_fkey FOREIGN KEY (site_b_id) REFERENCES public.heritage_sites(id)
);
CREATE TABLE public.routes (
id uuid NOT NULL DEFAULT gen_random_uuid(),
tourist_id uuid,
name text,
total_distance_km numeric,
total_duration_minutes integer,
status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'completed'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
is_curated boolean NOT NULL DEFAULT false,
CONSTRAINT routes_pkey PRIMARY KEY (id),
CONSTRAINT routes_tourist_id_fkey FOREIGN KEY (tourist_id) REFERENCES public.tourist_profiles(id)
);
CREATE TABLE public.route_stops (
id uuid NOT NULL DEFAULT gen_random_uuid(),
route_id uuid NOT NULL,
site_id uuid NOT NULL,
stop_order integer NOT NULL,
distance_from_prev_km numeric,
estimated_arrival timestamp with time zone,
CONSTRAINT route_stops_pkey PRIMARY KEY (id),
CONSTRAINT route_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id),
CONSTRAINT route_stops_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id)
);
CREATE TABLE public.qr_codes (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_id uuid NOT NULL,
code_value text NOT NULL UNIQUE,
status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
created_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT qr_codes_pkey PRIMARY KEY (id),
CONSTRAINT qr_codes_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id),
CONSTRAINT qr_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.qr_scan_logs (
id uuid NOT NULL DEFAULT gen_random_uuid(),
qr_code_id uuid NOT NULL,
scanned_at timestamp with time zone NOT NULL DEFAULT now(),
device_type text,
CONSTRAINT qr_scan_logs_pkey PRIMARY KEY (id),
CONSTRAINT qr_scan_logs_qr_code_id_fkey FOREIGN KEY (qr_code_id) REFERENCES public.qr_codes(id)
);
CREATE TABLE public.tourist_visits (
id uuid NOT NULL DEFAULT gen_random_uuid(),
site_id uuid NOT NULL,
tourist_id uuid,
visitor_type text CHECK (visitor_type = ANY (ARRAY['local'::text, 'domestic'::text, 'international'::text])),
age_group text,
visit_date date NOT NULL DEFAULT CURRENT_DATE,
source text CHECK (source = ANY (ARRAY['qr_scan'::text, 'recommendation'::text, 'direct_search'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT tourist_visits_pkey PRIMARY KEY (id),
CONSTRAINT tourist_visits_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.heritage_sites(id),
CONSTRAINT tourist_visits_tourist_id_fkey FOREIGN KEY (tourist_id) REFERENCES public.tourist_profiles(id)
);
CREATE TABLE public.audit_logs (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
action text NOT NULL,
module text,
details jsonb,
ip_address text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
category text CHECK (category = ANY (ARRAY['heritage'::text, 'governance'::text, 'municipality'::text, 'user_management'::text, 'settings'::text, 'media'::text, 'system'::text])),
target_type text,
target_id text,
detail jsonb,
user_agent text,
CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.system_settings (
id uuid NOT NULL DEFAULT gen_random_uuid(),
key text NOT NULL UNIQUE,
value jsonb,
updated_by uuid,
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT system_settings_pkey PRIMARY KEY (id),
CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.site_information (
id uuid NOT NULL DEFAULT gen_random_uuid(),
org_name text,
tagline text,
address text,
phone text,
email text,
website_url text,
social_links jsonb,
system_version text,
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT site_information_pkey PRIMARY KEY (id)
);
CREATE TABLE public.integrations (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
category text,
status text NOT NULL DEFAULT 'inactive'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'error'::text])),
api_key_masked text,
last_sync timestamp with time zone,
config jsonb,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT integrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.backups (
id uuid NOT NULL DEFAULT gen_random_uuid(),
backup_name text,
type text CHECK (type = ANY (ARRAY['full'::text, 'custom'::text])),
size_bytes bigint,
records_count integer,
created_by uuid,
status text,
file_url text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT backups_pkey PRIMARY KEY (id),
CONSTRAINT backups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.municipality_audit_log (
id uuid NOT NULL DEFAULT gen_random_uuid(),
municipality_id uuid NOT NULL,
action text NOT NULL CHECK (action = ANY (ARRAY['created'::text, 'status_changed'::text, 'updated'::text])),
performed_by uuid,
previous_value jsonb,
new_value jsonb NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT municipality_audit_log_pkey PRIMARY KEY (id),
CONSTRAINT municipality_audit_log_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id),
CONSTRAINT municipality_audit_log_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.review_reports (
id uuid NOT NULL DEFAULT gen_random_uuid(),
review_id uuid NOT NULL,
reported_by uuid NOT NULL,
reason text NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT review_reports_pkey PRIMARY KEY (id),
CONSTRAINT review_reports_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id),
CONSTRAINT review_reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.tourist_profiles(id)
);
CREATE TABLE public.heritage_site_versions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
heritage_site_id uuid NOT NULL,
snapshot jsonb NOT NULL,
changed_by uuid,
change_type text NOT NULL CHECK (change_type = ANY (ARRAY['created'::text, 'updated'::text, 'status_changed'::text])),
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT heritage_site_versions_pkey PRIMARY KEY (id),
CONSTRAINT heritage_site_versions_heritage_site_id_fkey FOREIGN KEY (heritage_site_id) REFERENCES public.heritage_sites(id),
CONSTRAINT heritage_site_versions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.governance_reviews (
id uuid NOT NULL DEFAULT gen_random_uuid(),
heritage_site_id uuid NOT NULL,
heritage_site_version_id uuid NOT NULL,
status text NOT NULL DEFAULT 'submitted'::text CHECK (status = ANY (ARRAY['submitted'::text, 'approved'::text, 'rejected'::text, 'archived'::text])),
submitted_by uuid NOT NULL,
submitted_at timestamp with time zone NOT NULL DEFAULT now(),
reviewed_by uuid,
reviewed_at timestamp with time zone,
reviewer_comment text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT governance_reviews_pkey PRIMARY KEY (id),
CONSTRAINT governance_reviews_heritage_site_id_fkey FOREIGN KEY (heritage_site_id) REFERENCES public.heritage_sites(id),
CONSTRAINT governance_reviews_heritage_site_version_id_fkey FOREIGN KEY (heritage_site_version_id) REFERENCES public.heritage_site_versions(id),
CONSTRAINT governance_reviews_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.staff_profiles(id),
CONSTRAINT governance_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.staff_profiles(id)
);
CREATE TABLE public.login_attempts (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
email_attempted text NOT NULL,
outcome text NOT NULL CHECK (outcome = ANY (ARRAY['success'::text, 'failed_password'::text, 'failed_locked'::text, 'failed_unknown_account'::text])),
ip_address text,
user_agent text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT login_attempts_pkey PRIMARY KEY (id),
CONSTRAINT login_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.security_events (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
event_type text NOT NULL,
detail text,
ip_address text,
user_agent text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT security_events_pkey PRIMARY KEY (id),
CONSTRAINT security_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.generated_reports (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
municipality_id uuid NOT NULL,
report_type text NOT NULL,
report_title text NOT NULL,
filters jsonb NOT NULL DEFAULT '{}'::jsonb,
generated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT generated_reports_pkey PRIMARY KEY (id),
CONSTRAINT generated_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
CONSTRAINT generated_reports_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id)
);
-- CHT-135 rich reviews (migration 20261101000000_rich_reviews.sql).
-- reviews.rating stays the overall 1-5 rating; for rich reviews it is round(avg(criteria scores)).
-- Writes go through public.submit_review(...) (SECURITY INVOKER, atomic).
-- Index: reviews_site_status_updated_idx ON reviews (site_id, status, updated_at DESC).
CREATE TABLE public.review_criteria_ratings (
review_id uuid NOT NULL,
criterion_key text NOT NULL CHECK (criterion_key ~ '^[a-z][a-z_]{0,39}$'), -- keys defined in features/reviews/constants.ts
score smallint NOT NULL CHECK (score >= 1 AND score <= 5),
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT review_criteria_ratings_pkey PRIMARY KEY (review_id, criterion_key),
CONSTRAINT review_criteria_ratings_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE
);
CREATE TABLE public.review_tags (
review_id uuid NOT NULL,
tag_key text NOT NULL CHECK (tag_key ~ '^[a-z][a-z_]{0,39}$'), -- keys defined in features/reviews/constants.ts
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT review_tags_pkey PRIMARY KEY (review_id, tag_key),
CONSTRAINT review_tags_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE
);
CREATE TABLE public.review_media (
id uuid NOT NULL DEFAULT gen_random_uuid(),
review_id uuid NOT NULL,
media_type text NOT NULL CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text])),
file_url text NOT NULL, -- public URL of storage_path in bucket review-media
storage_path text NOT NULL UNIQUE, -- '<random uuid>/<random uuid>.<ext>', never contains the user id
file_name text NOT NULL,
file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
mime_type text NOT NULL,
sort_order smallint NOT NULL DEFAULT 0,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT review_media_pkey PRIMARY KEY (id),
CONSTRAINT review_media_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE
);
-- Storage bucket review-media: public read, 30 MB bucket limit, image/jpeg|png|webp, video/mp4|quicktime.
-- CHT-136 Taal portal API (migration 20261102000000_taal_portal_api_indexes.sql).
-- Index: idx_heritage_sites_municipality_status_updated ON heritage_sites (municipality_id, publication_status, updated_at DESC).
-- Portal review reads reuse reviews_site_status_updated_idx (CHT-135). No new tables, policies or functions.
