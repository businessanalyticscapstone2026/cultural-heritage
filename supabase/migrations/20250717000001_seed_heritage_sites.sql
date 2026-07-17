-- Seed heritage_sites with real Batangas First District cultural heritage sites
-- Requires: municipalities and heritage_categories already populated

-- ============================================================
-- 1. Heritage Sites
-- ============================================================

INSERT INTO public.heritage_sites (id, site_name, category_id, municipality_id, barangay, exact_address, short_description, detailed_description, historical_period, year_established, latitude, longitude, publication_status, visibility, is_featured, average_rating, review_count, entrance_fee, designation)
VALUES
-- Taal — Basilica of St. Martin of Tours (Religious)
(
  gen_random_uuid(),
  'Basilica of St. Martin of Tours',
  '4be996c5-37fb-4e63-8791-2e2ee4e73776',
  '5d0df979-9524-49f2-bf6b-1ed9f9d563da',
  'Poblacion',
  'M. Agoncillo Street, Taal, Batangas',
  'One of the largest Catholic churches in the Philippines and a prime example of Baroque architecture.',
  'The Basilica of St. Martin of Tours is a Minor Basilica in Taal, Batangas, considered one of the largest churches in the Philippines and in Asia. Constructed in 1575 and rebuilt in the 19th century, it stands on a hilltop overlooking the town and Taal Lake. The church features a stunning Baroque facade with intricate stonework, a massive dome, and a bell tower. It houses the image of the Mahal na Poong Santa Cruz and is a declared National Cultural Treasure.',
  'Spanish Colonial',
  '1575',
  13.8872,
  120.9297,
  'published',
  'public',
  true,
  4.8,
  152,
  'Free',
  'National Cultural Treasure'
),
-- Taal — Marcela Agoncillo Historical Landmark (Historical)
(
  gen_random_uuid(),
  'Marcela Agoncillo Historical Landmark',
  'fa7a44b8-31c8-4b67-8a9a-ec43d73a1ac9',
  '5d0df979-9524-49f2-bf6b-1ed9f9d563da',
  'Poblacion',
  'Corner M. Agoncillo and G. Marella Streets, Taal, Batangas',
  'Birthplace and memorial to the woman who sewed the first Philippine flag.',
  'Marcela Mariño de Agoncillo (1859-1946) is renowned as the "Mother of the Philippine Flag" for hand-sewing the first Philippine flag in Hong Kong in 1898. Her ancestral house in Taal has been preserved as a historical landmark, showcasing period furniture, personal memorabilia, and exhibits on her life and contributions to Philippine independence.',
  'Revolutionary Period',
  '1859',
  13.8865,
  120.9285,
  'published',
  'public',
  true,
  4.5,
  87,
  '₱30',
  'National Historical Landmark'
),
-- Taal — Villa Tortuga (Heritage House)
(
  gen_random_uuid(),
  'Villa Tortuga',
  'e39d1c58-5db0-4b0b-82a8-f48c64ea7fca',
  '5d0df979-9524-49f2-bf6b-1ed9f9d563da',
  'Poblacion',
  'G. Marella Street, Taal, Batangas',
  'A heritage house museum that showcases Taal''s 19th-century aristocratic lifestyle.',
  'Villa Tortuga is a well-preserved 19th-century ancestral house in Taal that now functions as a heritage museum. Named after the tortoise-shaped foundation stones, the house features capiz-shell windows, hardwood floors, antique furniture, and a collection of religious icons and period photographs. It offers guided tours that provide insight into the affluent lifestyle of Batangas elite during the Spanish and American periods.',
  'Spanish Colonial',
  '1850',
  13.8878,
  120.9290,
  'published',
  'public',
  false,
  4.3,
  64,
  '₱50',
  NULL
),
-- Nasugbu — Calayo Beach (Natural)
(
  gen_random_uuid(),
  'Calayo Beach',
  '0a4295cb-6900-46f1-8fc6-bad01d369bc7',
  'a577b5ac-9ddb-4ea6-9db1-13ae764a773e',
  'Calayo',
  'Calayo, Nasugbu, Batangas',
  'A pristine white-sand beach known for its clear waters and coral reefs.',
  'Calayo Beach is one of Nasugbu''s most popular beach destinations, featuring fine white sand, crystal-clear turquoise waters, and vibrant coral reefs ideal for snorkeling. The beach is lined with coconut trees and offers a serene atmosphere away from the more crowded beach resorts. It is also a nesting site for marine turtles and a protected marine sanctuary area.',
  'Contemporary',
  NULL,
  14.0845,
  120.6140,
  'published',
  'public',
  false,
  4.4,
  203,
  '₱100',
  NULL
),
-- Nasugbu — Fortrident Mining / Kaysakat Diving (Natural)
(
  gen_random_uuid(),
  'Mount Batulao',
  '0a4295cb-6900-46f1-8fc6-bad01d369bc7',
  'a577b5ac-9ddb-4ea6-9db1-13ae764a773e',
  'Lual',
  'Sitio Lual, Nasugbu, Batangas',
  'A popular hiking destination with scenic grassland ridges and sea views.',
  'Mount Batulao is one of the most popular hiking destinations in Batangas, known for its rolling grassland ridges, scenic views of the West Philippine Sea, and relatively easy trail system. The mountain features multiple campsites with sea-of-clouds views during the early morning. It offers two major trailheads — the Evercrest Trail and the Batangas Trail — and is a favorite among beginner to intermediate hikers.',
  'Contemporary',
  NULL,
  14.0385,
  120.6870,
  'published',
  'public',
  false,
  4.6,
  318,
  'Free',
  NULL
),
-- Lemery — Saint Roch Parish Church (Religious)
(
  gen_random_uuid(),
  'Saint Roch Parish Church',
  '4be996c5-37fb-4e63-8791-2e2ee4e73776',
  '3e2598f6-f766-4529-b993-e3bb574e95cf',
  'Poblacion',
  'J.P. Rizal Street, Lemery, Batangas',
  'A historic church known for its unique Neo-Gothic architecture and the venerated image of San Roque.',
  'Saint Roch Parish Church, also known as Lemery Church, is a Neo-Gothic-style Catholic church completed in 1862 under the Augustinian Recollects. Its distinct facade features pointed arches, stained-glass windows, and a single bell tower. The church houses the miraculous image of San Roque, the patron saint of the town, whose feast is celebrated every August 16.',
  'Spanish Colonial',
  '1862',
  13.8789,
  120.8875,
  'published',
  'public',
  false,
  4.2,
  45,
  'Free',
  NULL
),
-- Calaca — Saint John the Baptist Parish Church (Religious)
(
  gen_random_uuid(),
  'Saint John the Baptist Parish Church',
  '4be996c5-37fb-4e63-8791-2e2ee4e73776',
  'e0af30e6-dc11-41ab-bfbf-061256da897e',
  'Poblacion',
  'Mabini Street, Calaca, Batangas',
  'A Spanish-era Baroque church famous for its massive retablo and centuries-old religious art.',
  'The Saint John the Baptist Parish Church in Calaca is a Baroque-style church built in 1836. It is notable for its massive three-story retablo (altar screen) carved in dark hardwood, which depicts scenes from the life of St. John the Baptist. The church also houses a collection of antique silver liturgical objects and a centuries-old pipe organ that is still occasionally played.',
  'Spanish Colonial',
  '1836',
  13.9317,
  120.8120,
  'published',
  'public',
  false,
  4.3,
  38,
  'Free',
  NULL
),
-- Balayan — Saint John the Baptist Parish Church (Religious)
(
  gen_random_uuid(),
  'Saint John the Baptist Parish Church (Balayan)',
  '4be996c5-37fb-4e63-8791-2e2ee4e73776',
  '15a5d0a7-66f4-4ed3-a741-fded6826c8db',
  'Poblacion',
  'M. Agoncillo Street, Balayan, Batangas',
  'Home to the centuries-old image of the Mahal na Poong Santa Cruz and the renowned Parada ng mga Pahiyas.',
  'Also known as Balayan Church, this historic church was built by the Augustinian missionaries in 1575. It is the home of the venerated image of the Mahal na Poong Santa Cruz (the Holy Cross), which is believed to have miraculous origins. The church is the focal point of the annual Parada ng mga Pahiyas and the Lenten processions that Balayan is famous for.',
  'Spanish Colonial',
  '1575',
  13.9390,
  120.7300,
  'published',
  'public',
  false,
  4.4,
  72,
  'Free',
  'Important Cultural Property'
),
-- Lian — Mount Manabo Natural Park (Natural)
(
  gen_random_uuid(),
  'Mount Manabo',
  '0a4295cb-6900-46f1-8fc6-bad01d369bc7',
  '72b6a92b-4fdb-4355-a0a2-1b06be887c46',
  'Manabo',
  'Barangay Manabo, Lian, Batangas',
  'A protected natural park featuring lush forests, waterfalls, and diverse wildlife.',
  'Mount Manabo Natural Park is a protected area in Lian known for its rich biodiversity, tropical rainforests, and cascading waterfalls. It serves as a watershed for nearby municipalities and is home to various endemic flora and fauna, including the Philippine hawk-eagle and several orchid species. The park offers eco-tourism activities such as trekking, birdwatching, and camping at designated sites.',
  'Contemporary',
  NULL,
  14.0250,
  120.6380,
  'published',
  'public',
  false,
  4.1,
  29,
  '₱50',
  'Protected Landscape'
),
-- Calatagan — Cape Santiago Lighthouse (Monuments & Landmarks)
(
  gen_random_uuid(),
  'Cape Santiago Lighthouse',
  '4bc2f206-b00e-4eeb-b5f9-b37c666f9eba',
  '7d6386fa-3bbc-4a7b-a6a0-beac13425bf8',
  'Barrio de la Luz',
  'Cape Santiago, Calatagan, Batangas',
  'A century-old lighthouse guiding ships through the Verde Island Passage.',
  'Cape Santiago Lighthouse, also known as Faro de Cabo Santiago, was built in 1890 during the Spanish colonial period. The lighthouse stands 15 meters tall and is constructed of granite and bricks. It still serves as an active navigational aid for ships traversing the Verde Island Passage. The site offers panoramic views of the West Philippine Sea and is surrounded by rugged coastal scenery.',
  'Spanish Colonial',
  '1890',
  13.7750,
  120.6490,
  'published',
  'public',
  true,
  4.5,
  96,
  'Free',
  'National Historical Landmark'
),
-- Tuy — Our Lady of Caysasay Shrine (Religious)
(
  gen_random_uuid(),
  'Our Lady of Caysasay Shrine',
  '4be996c5-37fb-4e63-8791-2e2ee4e73776',
  'd9d13b9b-c4dd-4eab-9109-8bb3bfddcb75',
  'Caysasay',
  'Barangay Caysasay, Tuy, Batangas',
  'A pilgrimage site built over a spring believed to have healing waters.',
  'The Our Lady of Caysasay Shrine is a pilgrimage site built over a natural spring that is believed to possess healing properties. The shrine features a small chapel constructed in baroque style, a grotto, and steps leading down to the spring. It is dedicated to Our Lady of Caysasay and attracts pilgrims especially during the Lenten season. The site is also archaeologically significant.',
  'Spanish Colonial',
  '1800',
  14.0100,
  120.7280,
  'published',
  'public',
  false,
  4.2,
  53,
  'Free',
  NULL
),
-- Calaca — Balubad Eco-Tourism Park (Natural)
(
  gen_random_uuid(),
  'Balubad Eco-Tourism Park',
  '0a4295cb-6900-46f1-8fc6-bad01d369bc7',
  'e0af30e6-dc11-41ab-bfbf-061256da897e',
  'Balubad',
  'Barangay Balubad, Calaca, Batangas',
  'An eco-park with zip-lining, hanging bridges, and panoramic views of Balayan Bay.',
  'Balubad Eco-Tourism Park is a community-based eco-tourism project offering adventure activities such as zip-lining, hanging bridges, and ATV rides. The park is situated on a hilltop providing panoramic views of Balayan Bay and the surrounding mountain ranges. It also features native gardens, picnic huts, and a viewing deck perfect for sunset watching.',
  'Contemporary',
  '2015',
  13.9150,
  120.8050,
  'published',
  'public',
  false,
  4.0,
  112,
  '₱150',
  NULL
),
-- Lemery — Lemery Museum (Museum)
(
  gen_random_uuid(),
  'Lemery Museum',
  'e9280a0f-704b-4f7f-87fc-28d62ee677e2',
  '3e2598f6-f766-4529-b993-e3bb574e95cf',
  'Poblacion',
  'Corner J.P. Rizal and M. Agoncillo Streets, Lemery, Batangas',
  'A local museum preserving the cultural heritage and archaeological finds of the Lemery area.',
  'The Lemery Museum is a small but well-curated museum that showcases the history and culture of Lemery and the surrounding First District of Batangas. Its collection includes prehistoric stone tools, pottery fragments from the Early Philippine period, Spanish-era religious artifacts, and exhibits on local industry such as salt-making and weaving. The museum also hosts rotating exhibits on local artists.',
  'Various',
  '2005',
  13.8780,
  120.8880,
  'published',
  'public',
  false,
  4.1,
  18,
  'Free',
  NULL
),
-- Balayan — Balayan Ancestral Houses (Heritage House)
(
  gen_random_uuid(),
  'Balayan Ancestral Houses District',
  'e39d1c58-5db0-4b0b-82a8-f48c64ea7fca',
  '15a5d0a7-66f4-4ed3-a741-fded6826c8db',
  'Poblacion',
  'Various streets in Poblacion, Balayan, Batangas',
  'A district of well-preserved Spanish-era stone houses showcasing traditional Batangueño architecture.',
  'The Balayan Ancestral Houses District is a collection of Spanish and American-period stone houses along the streets of Poblacion, Balayan. These houses feature thick coral-stone walls, capiz windows, red tile roofs, and spacious courtyards. Many are still inhabited by descendants of the original families. Noteworthy houses include the Villavicencio House, the Ilustre House, and the Garcellano Mansion.',
  'Spanish Colonial',
  '1800',
  13.9385,
  120.7310,
  'published',
  'public',
  true,
  4.6,
  134,
  'Free (some houses charge ₱20-50)',
  'Heritage Zone'
);

-- ============================================================
-- 2. Seed site_distances (Haversine-based approximate distances)
--    Only for a few well-known pairs to validate the Nearby
--    feature without computing all 91 pairs.
-- ============================================================

WITH site_pairs AS (
  SELECT
    a.id AS site_a_id,
    b.id AS site_b_id,
    a.site_name AS a_name,
    b.site_name AS b_name
  FROM public.heritage_sites a
  CROSS JOIN public.heritage_sites b
  WHERE a.id < b.id
    AND (
      -- Taal cluster (3 sites within walking distance)
      (a.site_name LIKE '%Basilica%' AND b.site_name LIKE '%Marcela%')
      OR (a.site_name LIKE '%Basilica%' AND b.site_name LIKE '%Villa Tortuga%')
      OR (a.site_name LIKE '%Marcela%' AND b.site_name LIKE '%Villa Tortuga%')
      -- Balayan cluster (2 sites close together)
      OR (a.site_name LIKE '%Balayan%Parish%' AND b.site_name LIKE '%Ancestral%')
      -- Calaca cluster
      OR (a.site_name LIKE '%Calaca%Parish%' AND b.site_name LIKE '%Balubad%')
      -- Lemery cluster
      OR (a.site_name LIKE '%Lemery%Parish%' AND b.site_name LIKE '%Lemery Museum%')
    )
)
INSERT INTO public.site_distances (site_a_id, site_b_id, distance_km, travel_time_minutes)
SELECT
  site_a_id, site_b_id,
  CASE
    WHEN a_name LIKE '%Basilica%' AND b_name LIKE '%Marcela%' THEN 0.3
    WHEN a_name LIKE '%Basilica%' AND b_name LIKE '%Villa Tortuga%' THEN 0.5
    WHEN a_name LIKE '%Marcela%' AND b_name LIKE '%Villa Tortuga%' THEN 0.4
    WHEN a_name LIKE '%Balayan%Parish%' AND b_name LIKE '%Ancestral%' THEN 0.6
    WHEN a_name LIKE '%Calaca%Parish%' AND b_name LIKE '%Balubad%' THEN 3.2
    WHEN a_name LIKE '%Lemery%Parish%' AND b_name LIKE '%Lemery Museum%' THEN 0.2
    ELSE 1.0
  END,
  CASE
    WHEN a_name LIKE '%Basilica%' AND b_name LIKE '%Marcela%' THEN 4
    WHEN a_name LIKE '%Basilica%' AND b_name LIKE '%Villa Tortuga%' THEN 7
    WHEN a_name LIKE '%Marcela%' AND b_name LIKE '%Villa Tortuga%' THEN 5
    WHEN a_name LIKE '%Balayan%Parish%' AND b_name LIKE '%Ancestral%' THEN 8
    WHEN a_name LIKE '%Calaca%Parish%' AND b_name LIKE '%Balubad%' THEN 8
    WHEN a_name LIKE '%Lemery%Parish%' AND b_name LIKE '%Lemery Museum%' THEN 3
    ELSE 10
  END
FROM site_pairs;

-- ============================================================
-- 3. Seed curated routes
-- ============================================================

-- "Taal Heritage Walk" curated route
WITH route_insert AS (
  INSERT INTO public.routes (id, name, total_distance_km, total_duration_minutes, status)
  VALUES (gen_random_uuid(), 'Taal Heritage Walk', 1.2, 120, 'draft')
  RETURNING id
)
INSERT INTO public.route_stops (route_id, site_id, stop_order)
SELECT
  ri.id,
  hs.id,
  s.stop_order
FROM route_insert ri
CROSS JOIN LATERAL (
  VALUES
    (1, 'Basilica of St. Martin of Tours'),
    (2, 'Marcela Agoncillo Historical Landmark'),
    (3, 'Villa Tortuga')
) AS s(stop_order, site_name)
JOIN public.heritage_sites hs ON hs.site_name = s.site_name;

-- "Balayan Heritage Tour" curated route
WITH route_insert AS (
  INSERT INTO public.routes (id, name, total_distance_km, total_duration_minutes, status)
  VALUES (gen_random_uuid(), 'Balayan Heritage Tour', 1.5, 150, 'draft')
  RETURNING id
)
INSERT INTO public.route_stops (route_id, site_id, stop_order)
SELECT
  ri.id,
  hs.id,
  s.stop_order
FROM route_insert ri
CROSS JOIN LATERAL (
  VALUES
    (1, 'Saint John the Baptist Parish Church (Balayan)'),
    (2, 'Balayan Ancestral Houses District')
) AS s(stop_order, site_name)
JOIN public.heritage_sites hs ON hs.site_name = s.site_name;
