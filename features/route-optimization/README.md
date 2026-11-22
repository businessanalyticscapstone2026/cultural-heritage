# Route Optimization

The tourist picks some heritage sites. This feature finds good orders to visit them and shows a few route options to compare.

## How a route is built

1. **Load the sites** in one database query.
2. **Leave out sites without a usable map location** (no latitude/longitude, `0,0`, or outside Batangas). We never guess coordinates. The tourist is told which sites were left out.
3. **Road distance table.** OSRM (OpenStreetMap roads) gives the driving distance and time between every pair of stops. If OSRM cannot be reached, we use the straight-line distance x 1.3 at 40 km/h and mark everything "estimated". Good tables are kept in memory for 10 minutes.
4. **Dijkstra's Shortest Path** finds the cheapest leg between every pair of stops, once by distance and once by time (`services/dijkstra.ts`). Dijkstra only works between two stops. It does not choose the visiting order of many stops.
5. **Choose the visiting order** (`services/solver.ts`):
   - up to 10 stops (11 points with "my location"): the exact best order, using Held-Karp dynamic programming;
   - more stops: Nearest Neighbor (always go to the closest next stop), then 2-opt (keep reversing parts of the route while that makes it better). Good, but not always perfect.
6. **Build the options** (`services/options.ts`). Options with the same order are merged into one card.
7. **Road line** for each different order from OSRM. If that fails, a straight dashed line is drawn and the card says "estimated".

Nothing is saved until the tourist presses **Save this route** (guests must log in first).

## The options

| Option | What it minimizes |
|---|---|
| Shortest (green) | Total driving distance |
| Fastest (blue) | Total driving time |
| Balanced (amber) | 0.4 x time + 0.4 x distance + 0.2 x town changes, each scaled 0..1 across the candidate routes |
| Highlights first (purple) | sum(position x rating), so best-rated stops come early; a time penalty is added until the trip fits the time limit |
| One town at a time (teal) | Number of town changes first, then distance |
| My order (gray) | Nothing: the order the tourist typed, shown only after they reorder stops by hand |

The weights are in `constants.ts` (`BALANCED_WEIGHTS`, `NEUTRAL_RATING`, `FALLBACK_*`).

Admin settings (`system_settings.key = 'routing_config'`) are used: `maxStops` (more stops is refused with a clear message), `maxTravelTimeMinutes` (longer options get "Over time limit"), and `preferShortestDistance` (when off, Fastest is recommended instead of Shortest).

## Limits

- Many published sites have no coordinates, so they cannot be routed until MTO offices add them in GIS Mapping.
- The OSRM server used is the free public demo (`router.project-osrm.org`). It is for light use only. Replace it with a self-hosted or paid router before real traffic.
- No live traffic, no opening hours, driving only (no walking or cycling).
- Saved routes do not remember which option they were, so the `/routes` page draws them in Shortest green.
