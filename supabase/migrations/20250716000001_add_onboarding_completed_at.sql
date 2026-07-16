alter table tourist_profiles
  add column if not exists onboarding_completed_at timestamptz;

-- Seed heritage_categories if empty
insert into heritage_categories (name, description, icon, color, display_order, status)
select * from (values
  ('Religious', 'Churches, chapels, and religious shrines with deep cultural roots.', 'Church', '#8B4513', 1, 'active'),
  ('Historical', 'Sites that played key roles in local and national history.', 'BookOpen', '#2E5BFF', 2, 'active'),
  ('Heritage House', 'Preserved ancestral houses showcasing traditional architecture.', 'Home', '#C1562B', 3, 'active'),
  ('Natural', 'Scenic natural attractions, parks, and landscapes.', 'Trees', '#2E7D32', 4, 'active'),
  ('Museum', 'Museums preserving artifacts, documents, and cultural treasures.', 'Library', '#6A1B9A', 5, 'active'),
  ('Monuments & Landmarks', 'Statues, markers, and iconic structures of historical value.', 'Landmark', '#B8860B', 6, 'active'),
  ('Cultural Events', 'Festivals, traditions, and intangible cultural heritage.', 'Music', '#C62828', 7, 'active'),
  ('Archaeological', 'Archaeological sites and ancient settlements.', 'Search', '#4E342E', 8, 'active'),
  ('Others', 'Other points of cultural interest not covered above.', 'MapPin', '#546E7A', 9, 'active')
) as v(name, description, icon, color, display_order, status)
where not exists (select 1 from heritage_categories limit 1);
