-- Migration: Add RLS policies for routes and route_stops to allow route creation and analytics reading

-- ============================================================================
-- 1. public.routes
-- ============================================================================
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Allow public (guests) and authenticated tourists/staff to insert routes
DROP POLICY IF EXISTS "Public and authenticated can insert routes" ON public.routes;
CREATE POLICY "Public and authenticated can insert routes"
  ON public.routes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow viewing curated routes, own routes, guest routes, or all routes for staff
DROP POLICY IF EXISTS "Users can view relevant routes" ON public.routes;
CREATE POLICY "Users can view relevant routes"
  ON public.routes FOR SELECT
  TO anon, authenticated
  USING (
    is_curated = true
    OR tourist_id IS NULL
    OR tourist_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid())
  );

-- Allow tourists to update their own routes
DROP POLICY IF EXISTS "Tourists can update own routes" ON public.routes;
CREATE POLICY "Tourists can update own routes"
  ON public.routes FOR UPDATE
  TO authenticated
  USING (tourist_id = auth.uid())
  WITH CHECK (tourist_id = auth.uid());

-- Allow tourists to delete their own routes
DROP POLICY IF EXISTS "Tourists can delete own routes" ON public.routes;
CREATE POLICY "Tourists can delete own routes"
  ON public.routes FOR DELETE
  TO authenticated
  USING (tourist_id = auth.uid());


-- ============================================================================
-- 2. public.route_stops
-- ============================================================================
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated tourists/staff to insert route stops
DROP POLICY IF EXISTS "Public and authenticated can insert route stops" ON public.route_stops;
CREATE POLICY "Public and authenticated can insert route stops"
  ON public.route_stops FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow viewing all route stops
DROP POLICY IF EXISTS "Public and authenticated can view route stops" ON public.route_stops;
CREATE POLICY "Public and authenticated can view route stops"
  ON public.route_stops FOR SELECT
  TO anon, authenticated
  USING (true);
