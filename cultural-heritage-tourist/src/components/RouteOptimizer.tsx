import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Route,
  MapPin,
  Navigation,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Check,
  Circle,
} from "lucide-react";
import { mapPins, type MapPin as MapPinType } from "@/data/map-pins";

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function buildDistanceMatrix(pins: MapPinType[]): number[][] {
  return pins.map((a) => pins.map((b) => haversineKm(a.coords, b.coords)));
}

function permute(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr];
  const result: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permute(rest)) {
      result.push([arr[i], ...p]);
    }
  }
  return result;
}

function solveTSPBruteForce(dist: number[][]): { order: number[]; total: number } {
  const n = dist.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  let bestOrder = indices;
  let bestDist = Infinity;

  for (const perm of permute(indices)) {
    let d = 0;
    for (let i = 0; i < perm.length - 1; i++) {
      d += dist[perm[i]][perm[i + 1]];
    }
    if (d < bestDist) {
      bestDist = d;
      bestOrder = perm;
    }
  }
  return { order: bestOrder, total: bestDist };
}

function solveTSPNearestNeighbor(dist: number[][]): { order: number[]; total: number } {
  const n = dist.length;
  const visited = new Set<number>();
  const order: number[] = [0];
  visited.add(0);

  while (visited.size < n) {
    const last = order[order.length - 1];
    let nearest = -1;
    let nearestDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && dist[last][j] < nearestDist) {
        nearestDist = dist[last][j];
        nearest = j;
      }
    }
    order.push(nearest);
    visited.add(nearest);
  }

  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    total += dist[order[i]][order[i + 1]];
  }
  return { order, total };
}

function solveTSP(pins: MapPinType[]): { order: number[]; total: number } {
  const dist = buildDistanceMatrix(pins);
  if (pins.length <= 8) {
    return solveTSPBruteForce(dist);
  }
  return solveTSPNearestNeighbor(dist);
}

function estimateTime(totalKm: number): string {
  const avgSpeedKmH = 60;
  const hours = totalKm / avgSpeedKmH;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const categoryColors: Record<string, string> = {
  Sacred: "bg-purple-500/10 text-purple-600",
  Colonial: "bg-amber-500/10 text-amber-600",
  UNESCO: "bg-emerald-500/10 text-emerald-600",
};

export function RouteOptimizer() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [optimized, setOptimized] = useState<{
    order: number[];
    total: number;
    pins: MapPinType[];
  } | null>(null);
  const [expanded, setExpanded] = useState(true);

  const allPins = useMemo(() => mapPins, []);

  const togglePin = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setOptimized(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allPins.map((p) => p.id)));
    setOptimized(null);
  }, [allPins]);

  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
    setOptimized(null);
  }, []);

  const selectedPins = useMemo(
    () => allPins.filter((p) => selectedIds.has(p.id)),
    [allPins, selectedIds],
  );

  const optimizedPins = useMemo(
    () => (optimized ? optimized.order.map((i) => optimized.pins[i]) : []),
    [optimized],
  );

  const handleOptimize = useCallback(() => {
    if (selectedPins.length < 2) return;
    const result = solveTSP(selectedPins);
    setOptimized({
      order: result.order,
      total: result.total,
      pins: selectedPins,
    });
    setExpanded(true);
  }, [selectedPins]);

  const handleReset = useCallback(() => {
    setOptimized(null);
    setSelectedIds(new Set());
  }, []);

  const legDistances = useMemo(() => {
    if (!optimized) return [];
    const dists: number[] = [];
    for (let i = 0; i < optimized.order.length - 1; i++) {
      const a = optimized.pins[optimized.order[i]];
      const b = optimized.pins[optimized.order[i + 1]];
      dists.push(haversineKm(a.coords, b.coords));
    }
    return dists;
  }, [optimized]);

  return (
    <div className="space-y-6">
      {/* Destination picker */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink-soft">
            <MapPin size={12} strokeWidth={1.5} className="text-accent" />
            <span>Select destinations for your route</span>
            {selectedIds.size > 0 && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">
                {selectedIds.size} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="font-mono text-[10px] uppercase tracking-wider text-accent/70 transition-colors hover:text-accent"
            >
              Select all
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearAll}
                className="font-mono text-[10px] uppercase tracking-wider text-ink-soft/50 transition-colors hover:text-ink-soft"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {allPins.map((pin) => {
            const active = selectedIds.has(pin.id);
            return (
              <button
                key={pin.id}
                onClick={() => togglePin(pin.id)}
                className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 ${
                  active
                    ? "border-accent/40 bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.06)]"
                    : "border-ink/10 bg-cream hover:border-ink/25"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      active
                        ? "border-accent bg-accent text-primary-foreground"
                        : "border-ink/20 bg-cream text-transparent"
                    }`}
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink">{pin.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-ink-soft">
                      {pin.municipality}
                    </p>
                  </div>
                </div>
                <span
                  className={`absolute right-2 top-2 rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${
                    categoryColors[pin.category] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {pin.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optimize button */}
      <div className="flex items-center gap-3 border-y border-ink/10 py-4">
        <button
          onClick={handleOptimize}
          disabled={selectedPins.length < 2}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
            selectedPins.length >= 2
              ? "bg-ink text-primary-foreground hover:bg-accent"
              : "cursor-not-allowed bg-ink/20 text-ink/30"
          }`}
        >
          <Zap size={14} strokeWidth={1.5} />
          Optimize Route
        </button>
        {optimized && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            <RotateCcw size={12} strokeWidth={1.5} />
            Reset
          </button>
        )}
        {selectedPins.length > 0 && selectedPins.length < 2 && (
          <span className="text-[11px] text-ink-soft/60">
            Select at least 2 destinations
          </span>
        )}
      </div>

      {/* Optimized itinerary */}
      <AnimatePresence mode="wait">
        {optimized && (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Summary stats */}
            <div className="flex items-center gap-6 rounded-xl border border-ink/10 bg-parchment/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Navigation size={14} strokeWidth={1.5} className="text-accent" />
                <div>
                  <p className="font-mono text-lg font-semibold text-ink">
                    {optimized.total.toFixed(1)}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-soft">
                    total km
                  </p>
                </div>
              </div>
              <span className="h-8 w-px bg-ink/10" />
              <div className="flex items-center gap-2">
                <Clock size={14} strokeWidth={1.5} className="text-accent" />
                <div>
                  <p className="font-mono text-lg font-semibold text-ink">
                    {estimateTime(optimized.total)}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-soft">
                    est. drive time
                  </p>
                </div>
              </div>
              <span className="h-8 w-px bg-ink/10" />
              <div className="flex items-center gap-2">
                <MapPin size={14} strokeWidth={1.5} className="text-accent" />
                <div>
                  <p className="font-mono text-lg font-semibold text-ink">
                    {optimizedPins.length}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-soft">
                    stops
                  </p>
                </div>
              </div>
            </div>

            {/* Route toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between rounded-xl border border-ink/10 bg-cream px-5 py-3 transition-colors hover:bg-parchment/40"
            >
              <div className="flex items-center gap-3">
                <Route size={14} strokeWidth={1.5} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                  Optimized itinerary
                </span>
              </div>
              {expanded ? (
                <ChevronUp size={14} strokeWidth={1.5} className="text-ink-soft" />
              ) : (
                <ChevronDown size={14} strokeWidth={1.5} className="text-ink-soft" />
              )}
            </button>

            {/* Timeline */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="relative pl-6">
                    {/* Vertical line */}
                    <div className="absolute left-[11px] top-3 bottom-3 w-px bg-ink/10" />

                    <div className="space-y-0">
                      {optimizedPins.map((pin, i) => {
                        const isLast = i === optimizedPins.length - 1;
                        const legDist = legDistances[i];

                        return (
                          <motion.div
                            key={`${pin.id}-${i}`}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: i * 0.06,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            {/* Stop */}
                            <div className="group relative flex items-start gap-4 py-3">
                              {/* Dot */}
                              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                                    i === 0
                                      ? "border-accent bg-accent text-primary-foreground"
                                      : isLast
                                        ? "border-ink/30 bg-cream text-ink-soft"
                                        : "border-ink/20 bg-cream text-ink-soft"
                                  }`}
                                >
                                  <span className="font-mono text-[9px] font-bold">
                                    {i + 1}
                                  </span>
                                </span>
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1 pb-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">
                                      {pin.name}
                                    </p>
                                    <p className="text-[11px] text-ink-soft">
                                      {pin.municipality}, {pin.province}
                                    </p>
                                  </div>
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${
                                      categoryColors[pin.category] ?? "bg-ink/5 text-ink/50"
                                    }`}
                                  >
                                    {pin.category}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-3">
                                  <span className="text-[10px] text-ink-soft/60">
                                    {pin.era}
                                  </span>
                                  {pin.accessibility.includes("wheelchair") && (
                                    <span className="text-[9px] text-ink-soft/40">
                                      ♿ Accessible
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Leg connector */}
                            {!isLast && legDist !== undefined && (
                              <div className="relative flex items-center gap-4 py-1 pl-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                  <div className="h-full w-px bg-ink/10" />
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-parchment/60 px-3 py-1.5">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="text-ink-soft/40"
                                    >
                                      <path d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                    <span className="font-mono text-[10px] text-ink-soft/60">
                                      {legDist.toFixed(1)} km
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-ink-soft/30">
                                    ·
                                  </span>
                                  <span className="font-mono text-[10px] text-ink-soft/40">
                                    ~{estimateTime(legDist)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
