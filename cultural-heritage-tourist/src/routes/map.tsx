import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Search, X, Navigation, Route as RouteIcon, MapPin, ChevronRight,
  Locate, Car, Footprints, GripVertical, Trash2, Plus, Clock, Ruler,
  RotateCcw, ChevronUp, ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const InteractiveMap = lazy(() =>
  import("@/components/InteractiveMap").then((m) => ({ default: m.InteractiveMap }))
);

export const Route = createFileRoute("/map")({
  component: MapPage,
});

const allSites = [
  { id: "basilica-martin", name: "Basilica of St. Martin de Tours", municipality: "Balayan", category: "Sacred", img: "/dest-1.jpg" },
  { id: "balayan-heritage-houses", name: "Balayan Heritage Houses", municipality: "Balayan", category: "Colonial", img: "/dest-2.jpg" },
  { id: "calatagan-archaeological", name: "Calatagan Archaeological Site", municipality: "Calatagan", category: "UNESCO", img: "/dest-4.jpg" },
  { id: "calatagan-ruins", name: "Calatagan Ruins", municipality: "Calatagan", category: "Colonial", img: "/dest-2.jpg" },
  { id: "lian-church", name: "Lian Church", municipality: "Lian", category: "Sacred", img: "/dest-1.jpg" },
  { id: "nasugbu-church", name: "Our Lady of the Assumption", municipality: "Nasugbu", category: "Sacred", img: "/dest-4.jpg" },
  { id: "fortune-island", name: "Fortune Island Ruins", municipality: "Nasugbu", category: "Colonial", img: "/dest-3.jpg" },
  { id: "tuy-church", name: "San Jose Parish Church", municipality: "Tuy", category: "Sacred", img: "/dest-1.jpg" },
  { id: "gulod-nature", name: "Gulod National Park", municipality: "Tuy", category: "Natural", img: "/dest-3.jpg" },
  { id: "malaruhatan-fort", name: "Malaruhatan Watchtower", municipality: "Lian", category: "Colonial", img: "/dest-4.jpg" },
];

type TravelMode = "car" | "walking";
type TourStop = { id: string; name: string; municipality: string; category: string; img: string };

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  "balayan": { "balayan": 0, "calatagan": 18, "lian": 12, "nasugbu": 28, "tuy": 22 },
  "calatagan": { "balayan": 18, "calatagan": 0, "lian": 25, "nasugbu": 35, "tuy": 30 },
  "lian": { "balayan": 12, "calatagan": 25, "lian": 0, "nasugbu": 15, "tuy": 18 },
  "nasugbu": { "balayan": 28, "calatagan": 35, "lian": 15, "nasugbu": 0, "tuy": 20 },
  "tuy": { "balayan": 22, "calatagan": 30, "lian": 18, "nasugbu": 20, "tuy": 0 },
};

function getDistance(from: string, to: string): number {
  const a = from.toLowerCase();
  const b = to.toLowerCase();
  return DISTANCE_MATRIX[a]?.[b] ?? 15;
}

function computeRoute(stops: TourStop[]): { totalKm: number; duration: string } {
  if (stops.length < 2) return { totalKm: 0, duration: "0 min" };
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += getDistance(stops[i].municipality, stops[i + 1].municipality);
  }
  const hours = Math.floor(total / 40);
  const mins = Math.round(((total / 40) - hours) * 60) + stops.length * 15;
  const totalMin = hours * 60 + mins;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return { totalKm: total, duration: h > 0 ? `${h}h ${m}m` : `${m} min` };
}

function openNavigation(stops: TourStop[], mode: TravelMode) {
  if (stops.length === 0) return;
  if (stops.length === 1) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stops[0].name + ", " + stops[0].municipality + ", Batangas")}&travelmode=${mode}`, "_blank");
    return;
  }
  const origin = `${stops[0].name}, ${stops[0].municipality}, Batangas`;
  const dest = `${stops[stops.length - 1].name}, ${stops[stops.length - 1].municipality}, Batangas`;
  const waypoints = stops.slice(1, -1).map(s => `${s.name}, ${s.municipality}, Batangas`).join("|");
  const params = new URLSearchParams({ api: "1", origin, destination: dest, travelmode: mode });
  if (waypoints) params.set("waypoints", waypoints);
  window.open(`https://www.google.com/maps/dir/?${params.toString()}`, "_blank");
}

function MapPage() {
  const [search, setSearch] = useState("");
  const [showNearby, setShowNearby] = useState(false);

  // Route optimization state
  const [destSelect, setDestSelect] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("car");
  const [optimized, setOptimized] = useState<{ km: number; duration: string } | null>(null);
  const [showRouteResult, setShowRouteResult] = useState(false);

  // Heritage tour state
  const [tourStops, setTourStops] = useState<TourStop[]>([]);
  const [showTour, setShowTour] = useState(false);
  const [addToTourQuery, setAddToTourQuery] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const filteredPins = search
    ? allSites.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.municipality.toLowerCase().includes(search.toLowerCase())
      )
    : allSites;

  const addableSites = addToTourQuery
    ? allSites.filter(p => !tourStops.some(t => t.id === p.id) && (
        p.name.toLowerCase().includes(addToTourQuery.toLowerCase()) ||
        p.municipality.toLowerCase().includes(addToTourQuery.toLowerCase())
      ))
    : allSites.filter(p => !tourStops.some(t => t.id === p.id));

  const tourRoute = computeRoute(tourStops);

  const handleOptimize = useCallback(() => {
    if (!destSelect) return;
    const site = allSites.find(s => s.id === destSelect);
    if (!site) return;
    setOptimized({ km: getDistance("Balayan", site.municipality) + 5, duration: travelMode === "car" ? "35 min" : "2h 10m" });
    setShowRouteResult(true);
  }, [destSelect, travelMode]);

  const handleOptimizeTour = useCallback(() => {
    if (tourStops.length < 2) return;
    const sorted = [...tourStops].sort((a, b) => {
      const da = getDistance("Balayan", a.municipality);
      const db = getDistance("Balayan", b.municipality);
      return da - db;
    });
    setTourStops(sorted);
    const r = computeRoute(sorted);
    setOptimized({ km: r.totalKm, duration: r.duration });
    setShowRouteResult(true);
  }, [tourStops]);

  const addToTour = (site: TourStop) => {
    setTourStops(prev => [...prev, site]);
    setAddToTourQuery("");
    setShowAddDropdown(false);
  };

  const removeFromTour = (id: string) => {
    setTourStops(prev => prev.filter(s => s.id !== id));
    setShowRouteResult(false);
    setOptimized(null);
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    setTourStops(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <Navbar />

      <div className="h-full w-full pt-14">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-ink">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-cream/60">
                Loading map...
              </p>
            </div>
          }
        >
          <InteractiveMap />
        </Suspense>
      </div>

      {/* Search bar */}
      <div className="absolute left-1/2 top-[4.5rem] z-[1000] w-full max-w-md -translate-x-1/2 px-4">
        <div className="relative">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-ink/10 bg-cream/95 py-2.5 pl-10 pr-10 text-sm text-ink shadow-lg backdrop-blur-sm outline-none placeholder:text-ink-soft/60 focus:border-accent/40"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
              <X size={14} />
            </button>
          )}
        </div>
        {search && filteredPins.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto rounded-2xl border border-ink/10 bg-cream/95 shadow-lg backdrop-blur-sm">
            {filteredPins.map((pin) => (
              <Link
                key={pin.id}
                to="/heritage/$id"
                params={{ id: pin.id }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-parchment/50 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <MapPin size={14} className="shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{pin.name}</p>
                  <p className="text-xs text-ink-soft">{pin.municipality} · {pin.category}</p>
                </div>
                <ChevronRight size={14} className="shrink-0 text-ink-soft" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Left panel */}
      <div className="pointer-events-auto absolute left-4 top-[14rem] z-[1000] flex max-h-[calc(100vh-16rem)] flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin">
        {/* Title */}
        <div className="max-w-xs rounded-2xl border border-ink/10 bg-cream/90 px-5 py-4 shadow-lg backdrop-blur-sm">
          <h1 className="text-display text-lg leading-tight text-ink">Interactive GIS Atlas</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">Explore heritage sites across Batangas 1st District.</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setShowTour(!showTour); setShowNearby(false); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-all ${
              showTour ? "border border-accent/40 bg-accent/10 text-accent" : "border border-ink/10 bg-cream/90 text-ink-soft hover:text-ink"
            }`}
          >
            <RouteIcon size={14} />
            Routes
          </button>
          <button
            onClick={() => { setShowNearby(!showNearby); setShowTour(false); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-all ${
              showNearby ? "border border-accent/40 bg-accent/10 text-accent" : "border border-ink/10 bg-cream/90 text-ink-soft hover:text-ink"
            }`}
          >
            <Locate size={14} />
            Nearby
          </button>
        </div>

        {/* Route Optimization panel */}
        <AnimatePresence>
          {showTour && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-72 rounded-2xl border border-ink/10 bg-cream/95 p-5 shadow-lg backdrop-blur-sm"
            >
              {/* --- Single destination --- */}
              <h3 className="text-display text-base text-ink">Route Optimization</h3>

              <div className="mt-4 space-y-3">
                {/* Destination select */}
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-widest text-ink-soft">Destination</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <select
                      value={destSelect}
                      onChange={(e) => { setDestSelect(e.target.value); setShowRouteResult(false); setOptimized(null); }}
                      className="w-full appearance-none rounded-xl border border-ink/10 bg-card py-2.5 pl-9 pr-8 text-sm text-ink outline-none focus:border-accent/40"
                    >
                      <option value="">Select destination…</option>
                      {allSites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                  </div>
                </div>

                {/* Travel mode */}
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-ink-soft">Travel Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTravelMode("car")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all ${
                        travelMode === "car"
                          ? "border border-accent/40 bg-accent/10 text-accent"
                          : "border border-ink/10 bg-card text-ink-soft hover:text-ink"
                      }`}
                    >
                      <Car size={14} />
                      Car
                    </button>
                    <button
                      onClick={() => setTravelMode("walking")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all ${
                        travelMode === "walking"
                          ? "border border-accent/40 bg-accent/10 text-accent"
                          : "border border-ink/10 bg-card text-ink-soft hover:text-ink"
                      }`}
                    >
                      <Footprints size={14} />
                      Walking
                    </button>
                  </div>
                </div>

                {/* Optimize button */}
                <button
                  onClick={handleOptimize}
                  disabled={!destSelect}
                  className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Optimize Route
                </button>
              </div>

              {/* Result */}
              <AnimatePresence>
                {showRouteResult && optimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 border-t border-ink/10 pt-4">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-accent" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-ink-soft">Est. Time</p>
                            <p className="text-sm font-semibold text-ink">{optimized.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler size={14} className="text-accent" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-ink-soft">Distance</p>
                            <p className="text-sm font-semibold text-ink">{optimized.km} km</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const site = allSites.find(s => s.id === destSelect);
                          if (site) openNavigation([site], travelMode);
                        }}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-ink/90"
                      >
                        <Navigation size={14} />
                        Start Navigation
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="my-5 border-t border-ink/10" />

              {/* --- Multi-stop Tour --- */}
              <h3 className="text-display text-base text-ink">My Heritage Tour</h3>
              <p className="mt-1 text-xs text-ink-soft">
                {tourStops.length === 0
                  ? "Build a multi-stop heritage tour."
                  : `${tourStops.length} stop${tourStops.length > 1 ? "s" : ""} · ${tourRoute.totalKm} km · ${tourRoute.duration}`}
              </p>

              {/* Tour stops */}
              <div className="mt-3 space-y-1.5">
                {tourStops.length === 0 && (
                  <p className="py-4 text-center text-xs text-ink-soft/60">No stops added yet</p>
                )}
                {tourStops.map((stop, i) => (
                  <motion.div
                    key={stop.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 rounded-xl border border-ink/10 bg-card px-3 py-2"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{stop.name}</p>
                      <p className="text-[10px] text-ink-soft">{stop.municipality}</p>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        onClick={() => moveStop(i, -1)}
                        disabled={i === 0}
                        className="grid h-5 w-5 place-items-center rounded text-ink-soft hover:text-ink disabled:opacity-20"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => moveStop(i, 1)}
                        disabled={i === tourStops.length - 1}
                        className="grid h-5 w-5 place-items-center rounded text-ink-soft hover:text-ink disabled:opacity-20"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        onClick={() => removeFromTour(stop.id)}
                        className="grid h-5 w-5 place-items-center rounded text-ink-soft hover:text-red-500"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add stop */}
              <div className="relative mt-3">
                <div className="relative">
                  <Plus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    placeholder="Add a stop…"
                    value={addToTourQuery}
                    onChange={(e) => { setAddToTourQuery(e.target.value); setShowAddDropdown(true); }}
                    onFocus={() => setShowAddDropdown(true)}
                    className="w-full rounded-xl border border-ink/10 bg-card py-2 pl-9 pr-3 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40"
                  />
                </div>
                <AnimatePresence>
                  {showAddDropdown && addableSites.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute inset-x-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-ink/10 bg-cream shadow-lg"
                    >
                      {addableSites.slice(0, 6).map(site => (
                        <button
                          key={site.id}
                          onClick={() => addToTour(site)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-parchment/60 first:rounded-t-xl last:rounded-b-xl"
                        >
                          <MapPin size={11} className="shrink-0 text-accent" />
                          <span className="truncate text-ink">{site.name}</span>
                          <span className="ml-auto text-[10px] text-ink-soft">{site.municipality}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tour actions */}
              {tourStops.length >= 2 && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleOptimizeTour}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-accent/90"
                  >
                    <RotateCcw size={12} />
                    Optimize Route
                  </button>
                  <button
                    onClick={() => openNavigation(tourStops, travelMode)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-ink/90"
                  >
                    <Navigation size={12} />
                    Start Navigation
                  </button>
                </div>
              )}
              {tourStops.length > 0 && (
                <button
                  onClick={() => { setTourStops([]); setOptimized(null); setShowRouteResult(false); }}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-ink/10 bg-card py-2 text-[11px] text-ink-soft transition-colors hover:text-ink"
                >
                  <Trash2 size={11} />
                  Clear tour
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby panel */}
        <AnimatePresence>
          {showNearby && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-72 rounded-2xl border border-ink/10 bg-cream/95 p-5 shadow-lg backdrop-blur-sm"
            >
              <h3 className="text-display text-base text-ink mb-3">Recommended Nearby</h3>
              <p className="text-xs text-ink-soft mb-4">Heritage sites close to your location:</p>
              <div className="space-y-3">
                {allSites.slice(0, 5).map((pin) => (
                  <Link
                    key={pin.id}
                    to="/heritage/$id"
                    params={{ id: pin.id }}
                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-parchment/50"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-parchment">
                      <img src={pin.img} alt={pin.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink group-hover:text-accent truncate">{pin.name}</p>
                      <p className="text-xs text-ink-soft">{pin.municipality} · {pin.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info badge */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-full border border-ink/10 bg-cream/90 px-4 py-2 shadow backdrop-blur-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
          {allSites.length} heritage sites across 5 municipalities
        </p>
      </div>
    </main>
  );
}
