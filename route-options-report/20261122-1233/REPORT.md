# Route Options: Report (2026-11-22)

Branch: `feat/route-options` (3 commits: `070836c`, `20e2173`, `f87866f`). Nothing is pushed. No database migrations were applied.

## 1. Summary in 5 lines

1. Tourists now press **Find best routes** and get up to 6 route options (Shortest in green, Fastest, Balanced, Highlights first, One town at a time, My order). They can compare them on the map and save the one they like.
2. They can pick where to start (My location / Best start / First stop) and turn on "Return to start".
3. Sites with no map location are left out with a message. They are no longer sent to the middle of the ocean as `0,0`.
4. Not done: browser test of the "site without location" path (the map page never lists those sites, so it cannot be reached from the UI; unit tests cover it). The tourist map has no real dark theme, so the dark screenshots look the same as the light ones.
5. You need to: review and merge the branch, delete 4 test routes (section 9), ask the MTO offices to add coordinates for 87 sites (section 7), and plan to replace the public OSRM demo server.

## 2. Status table

| Task | Result | Evidence |
|---|---|---|
| Branch, small commits | DONE | `git log master..feat/route-options` (3 commits) |
| Dijkstra kept, binary heap, `weight: "distance" \| "time"` | DONE | `features/route-optimization/services/dijkstra.ts:21`, re-exported at `services/index.ts:18`; tests in `dijkstra.test.ts` |
| Road matrix (OSRM table), fallback, 10-min cache | DONE | `services/matrix.ts:50`; `matrix.test.ts` |
| Held-Karp (≤10 stops), NN + 2-opt above | DONE | `services/solver.ts:44`, `:109`, `:139`; `solver.test.ts` |
| 5 strategies + My order, merge duplicates, deltas | DONE | `services/options.ts:69`, `:169`; `options.test.ts` |
| Generate first, save later | DONE | `actions/index.ts:64` (`generateRouteOptionsAction`), `:80` (`saveRouteAction`) |
| `createRouteAction` still works (thin wrapper) | DONE | `services/index.ts:285`. Type-checked; no live caller found (the `/routes` "New Route" button is a stub) |
| Leave out bad coordinates, friendly error | DONE | `matrix.ts:28`, `services/index.ts:67`; `generate-route-options.test.ts` |
| N+1 query removed | DONE | one `heritage_sites` query in `generateRouteOptions` |
| `routing_config` used (maxStops, time limit, preferShortest) | DONE | `features/settings/services/index.ts:149` (`getRoutingConfigPublic`); tests "rejects more stops…", "Fastest recommended by setting" |
| Admin settings text | DONE | `features/settings/components/threshold-settings-form.tsx` |
| Zod validation on the server | DONE | `actions/index.ts` (`generateSchema`, `saveSchema`) |
| Planner UI (cards, radiogroup, start, round trip, states) | DONE | `components/route-options-list.tsx:101`, `route-planner-panel.tsx:268`, `:334`; screenshots |
| Map: selected solid, compare dashed, markers renumber, re-fit | DONE | `features/gis/components/tourist-gis-panel.tsx:890`; Playwright "Markers follow…", `light-3-compare-all.png` |
| `/routes` map uses Shortest green | DONE | `components/route-map-view.tsx` |
| AGENTS.md + README | DONE | `AGENTS.md` (Route Optimization section), `features/route-optimization/README.md` |
| Unit tests | DONE | 30 new tests, 234 total pass |
| Playwright (light) | DONE | 19/19 checks, `playwright-results.json` |
| Playwright (dark) | DONE, but see note | 16/16 checks, `playwright-results-dark.json`. The page has no dark styles, so this only proves it works with a dark color-scheme preference |
| Browser: site without coordinates excluded | NOT VERIFIED | The map only lists sites that have coordinates (`features/gis/services/tourist-map.ts:68`), so the UI cannot add one. Covered by unit test "leaves out sites without a usable map location…" |
| Browser: OSRM offline | NOT VERIFIED in browser (as planned) | Unit tests "falls back to straight-line estimates…" and "still works offline…" |
| Optional `option_kind` migration | NOT DONE (on purpose) | Not needed; `/routes` uses green for all saved routes |

## 3. Files changed

Created
- `features/route-optimization/constants.ts`: option labels, colors, weights, bounding box, fallback numbers
- `features/route-optimization/services/dijkstra.ts`: Dijkstra moved here, binary heap, distance/time weight
- `features/route-optimization/services/solver.ts`: Held-Karp, Nearest Neighbor, 2-opt (pure)
- `features/route-optimization/services/options.ts`: builds the options, merges duplicates, deltas (pure)
- `features/route-optimization/services/matrix.ts`: OSRM table, straight-line fallback, cache, coordinate check
- `features/route-optimization/components/route-options-list.tsx`: option cards, compare switch, save button
- `features/route-optimization/README.md`
- Tests: `services/{solver,options,matrix,dijkstra,generate-route-options}.test.ts`

Edited
- `features/route-optimization/services/index.ts`: `generateRouteOptions`, `saveRoute`; `createRoute` is now a wrapper; old `buildGraph`/`computeItineraryOrder` removed
- `features/route-optimization/actions/index.ts`: `generateRouteOptionsAction`, `saveRouteAction` (zod)
- `features/route-optimization/hooks/index.ts`: `useRouteOptions`, `useRoutePlanner`, `useSaveRoute`
- `features/route-optimization/types.ts`: option types
- `features/route-optimization/components/route-planner-panel.tsx`: new flow, Start from, Return to start, add-stop dropdown fix
- `features/route-optimization/components/route-map-view.tsx`: `color` prop, green default
- `features/gis/stores/gis-ui.ts` (+ test): `activeRoute` removed; added `selectedOptionKind`, `compareAllRoutes`, `routeStartMode`, `routeRoundTrip`, `routeOrderEdited` (UI state only)
- `features/gis/components/tourist-gis-panel.tsx`: draws options and markers
- `features/gis/services/directions.ts`: exports `OSRM_BASE_URL` (no other change)
- `features/settings/services/index.ts`: `getRoutingConfigPublic()`
- `features/settings/components/threshold-settings-form.tsx`: help text only
- `AGENTS.md`: routing folder name and honest algorithm description

Deleted: none.

## 4. How each option is calculated

All options use the same road table (OSRM). Dijkstra gives the cheapest leg between each pair of stops; the solver picks the order.

- **Shortest (green):** the order with the least total kilometres.
- **Fastest (blue):** the order with the least total minutes.
- **Balanced (amber):** we take the Shortest, Fastest, Highlights and One-town orders plus one extra "mixed" order, scale each route's time, distance and town changes to 0..1, and pick the lowest `0.4 x time + 0.4 x distance + 0.2 x town changes`.
- **Highlights first (purple):** minimizes `sum(position x rating)`, so the best-rated stops come first. If that trip is over the time limit, a time penalty is added step by step until it fits. If even the fastest route is over the limit, it keeps the pure highlights order and is marked "Over time limit".
  - Note: the brief's formula `sum(position x (1 - rating))` would put the **worst**-rated stops first, so I used `sum(position x rating)`, which does what the brief describes.
  - Rating = `average_rating / 5` when `review_count > 0`, else 0.5 (neutral). Columns are from `20250712000003_add_review_aggregates.sql`.
- **One town at a time (teal):** a town change costs more than any total distance could, so it first gets the fewest town changes, then the shortest distance.
- **My order (gray):** the order the tourist typed. It only appears after they move a stop by hand.

Where to tune: `features/route-optimization/constants.ts` (`BALANCED_WEIGHTS`, `NEUTRAL_RATING`, `EXACT_SOLVER_MAX_POINTS`, `FALLBACK_ROAD_FACTOR`, `FALLBACK_SPEED_KMH`, `MATRIX_CACHE_TTL_MS`, `BATANGAS_BOUNDS`).

One change from the brief: card numbers always come from the road table, not from the OSRM route call. In the first browser run, using the route-call totals made Fastest show **59.2 km while Shortest showed 59.3 km**, which looked wrong. The route call is now used only for the line on the map.

## 5. Verification

| Check | Baseline | Now |
|---|---|---|
| `bun test` | 204 pass (the brief said 188; the repo had 204 today) | **234 pass, 0 fail** |
| `bunx tsc --noEmit` | 2 errors (test files) | **same 2 errors**, none new |
| `bun run lint` | 47 errors, 101 warnings | **47 errors, 99 warnings** (no new findings) |
| `bun run build` | pass | **pass** |

New unit tests (30):
- `solver.test.ts` (6): Held-Karp equals brute force on 20 seeded 7-stop asymmetric matrices (free start, fixed start, round trip); n = 0/1/2/3; identical points; position-aware cost; 12 points with NN + 2-opt is valid and not worse than NN; Held-Karp beats NN on a trap case.
- `options.test.ts` (10): Shortest vs Fastest differ; merging and deltas; one-town ≤ Shortest town changes; highlights order; highlights within the limit; `exceedsTimeLimit`; `preferShortestDistance = false` gives Fastest; My order; round trip leg; deltas with no Shortest card.
- `matrix.test.ts` (6): OSRM parsing and reorder; offline fallback; null pair; cache hit (fetch called once); estimates not cached; coordinate filter (null, 0/0, Manila).
- `dijkstra.test.ts` (4): old signature unchanged; `weight: "time"` takes the fast path; unreachable / same node; goes through another stop when cheaper.
- `generate-route-options.test.ts` (4): `maxStops` error; excluded sites never become `0,0`; fewer than 2 routable sites gives the friendly error; offline end-to-end (estimated, round-trip path, setting-based recommendation).

Playwright (production build on `localhost:3100`, tourist account from `creds.md`, 6 sites in 4 towns, location set to Taal): **35/35 checks passed** (`playwright-results.json` light 19 + dark 16; `playwright-results-dark.json` for the final dark rerun, 16/16). Options appeared in about 2 seconds. Cards: "Shortest + Balanced + One town at a time" (59 km, 67 min, Recommended), "Fastest" (59.1 km, 67 min, +0.1 km · 0 min), "Highlights first" (117 km, 124 min). Mouse and arrow keys change the selection, focus follows, markers renumber (west-to-east order `6 5 4 3 2 1` became `6 5 4 3 1 2`), compare mode draws all lines, changing "Start from" or moving a stop clears the options, "My order" appears after a manual reorder, and Save shows "Route saved".

Screenshots (this folder): `light-1-options.png`, `light-2-second-option.png`, `light-3-compare-all.png`, `light-4-my-order.png`, `dark-1-options.png`, `dark-2-second-option.png`, `dark-3-compare-all.png`.

Accessibility: radiogroup with roving focus and arrow keys, visible focus rings, `aria-live="polite"` text ("3 route options found."), every option has a text label and an icon (color is never alone), and estimated lines are dashed. Text is ink on white or parchment, and the "Over time limit" text is `red-700` on white. These are well above 4.5:1, but I did not measure them with a tool.

## 6. Side effects

- **"Route Plans Created" KPI now counts saved routes, not presses of Optimize.** It counts non-curated rows in `routes` (`features/analytics/services/index.ts:83`, `features/mto-analytics/services/index.ts:139`, `features/dashboard/services/index.ts:223`). The recommendation funnel also uses this count for "Route Plans" and for "Conversions" (`features/analytics/services/index.ts:508-509`). The numbers will drop, but they are more honest: a saved route is a real plan. Consider renaming it to "Routes Saved" (not done).
- **Guests** can still generate and compare options but cannot save. Before, a guest's press of Optimize tried to insert a `routes` row with `tourist_id = null` (I did not check whether RLS allowed it).
- **`createRouteAction`** keeps its signature and return type. It now generates the options, picks the recommended one, and saves it. As before, it starts from the tourist's home location if it is set, and it still returns the route with `id: null` if saving fails.
- **`site_distances`** (0 rows) is no longer read; road distances come from OSRM.
- Saved routes do not record which option they were (no `option_kind` column), so `/routes` draws all of them in Shortest green.
- The server trusts the totals the browser sends when saving. They are range-checked and only describe the tourist's own route, so the risk is low. If exact numbers matter for analytics, recompute them on save.
- Fixed a small existing bug: the "Add a stop" list re-opened after every pick and covered the planner buttons.

## 7. Data problems found

Published sites without coordinates (read-only, run today):

| Municipality | Published sites with no coordinates |
|---|---|
| Taal | 61 |
| Balayan | 6 |
| Calaca | 5 |
| Calatagan | 4 |
| Lemery | 3 |
| Lian | 3 |
| Tuy | 3 |
| Nasugbu | 2 |
| **Total** | **87 of 106 published** (only 19 can be routed) |

No published site has coordinates outside Batangas.

```sql
select m.name as municipality, count(*) as sites_without_location,
       string_agg(h.site_name, ', ' order by h.site_name) as sites
from heritage_sites h
left join municipalities m on m.id = h.municipality_id
where h.publication_status = 'published'
  and (h.latitude is null or h.longitude is null)
group by m.name
order by sites_without_location desc;
```

What MTO offices must do: open GIS Mapping, find each listed site, and set its correct location (latitude/longitude). Until then those sites do not appear on the tourist map and cannot be part of a route.

(I ran the count through the REST API with the public key and grouped the rows locally. The SQL above is the same query for the SQL editor; I did not run that exact text.)

## 8. Risks and limits

- **OSRM public demo server** (`router.project-osrm.org`): light use only, no uptime promise, and it may rate-limit. Each "Find best routes" makes 1 table call plus 1 route call per distinct order (up to 6). Replace it with a self-hosted or paid router before real traffic.
- **Estimated fallback:** if OSRM is down, distances are straight line x 1.3 at 40 km/h. The cards say "Estimated" and the line is dashed.
- **Exact limit:** exact order up to 10 stops (11 points with "My location"). Above that it is good but not always the best. `maxStops` defaults to 10, so the exact method covers the default setting.
- **Cache** is in memory per server instance (10 minutes); serverless instances do not share it.
- No live traffic, no opening hours, driving only.
- The existing `fetchDrivingDirections` ("Get Directions" for a single site) is still called from the browser. Out of scope; not changed.

## 9. Things I created during testing

Route rows (tourist `juan.delacruz`, each with 6 `route_stops`). Delete them when you are ready:
- `f2f47678-d671-458f-92f5-f44bc60a60bf`
- `e6a90fe3-37af-4e37-b1c5-1ffe60acb3b1`
- `7f630b94-e9b6-493f-993a-5fcd802ffced`
- `503a53e1-6255-4b49-880a-824d470223e5`

```sql
-- check first, then delete the stops and routes
select id, name, created_at from routes where name like 'Playwright test route %';
-- delete from route_stops where route_id in (...); delete from routes where id in (...);
```

Folders and files:
- Playwright scratch folder (outside the repo): `/tmp/claude-1000/-home-franciss-Documents-work-conexus-cultural-heritage/fd0138ef-fedd-4e95-ba7b-a0efef8bcde7/scratchpad/pw`
- This report folder `route-options-report/20261122-1233/` (not committed)

## 10. Plain-English explanation

Imagine running six errands across town. You could take the order with the fewest kilometres, the order that is quickest (highways beat short but slow streets), the order that visits your favourite shops first, or the order that finishes one neighbourhood before moving on. Each one is "best" in its own way.
The app now works like that. A road map service tells us the driving distance and time between every pair of stops. Dijkstra's method finds the cheapest way from one stop to the next. A second step tries the possible orders and keeps the best one for each goal.
If two goals give the same order, you see one card. Green (Shortest) is suggested first, but you can compare all of them on the map and save the one you like.
