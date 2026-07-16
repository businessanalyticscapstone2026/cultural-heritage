import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  MapPin,
  Church,
  Landmark,
  TreePine,
  Mountain,
  Clock,
  Palette,
  UtensilsCrossed,
  Waves,
  RotateCcw,
  ChevronRight,
  Star,
  Accessibility,
  Trophy,
} from "lucide-react";
import { mapPins, type MapPin as MapPinType } from "@/data/map-pins";
import { provinces } from "@/data/provinces";

interface Interest {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  keywords: string[];
  weight: number;
}

const interests: Interest[] = [
  { id: "sacred", label: "Sacred Sites", icon: Church, keywords: ["sacred", "church", "basilica", "baroque"], weight: 1.0 },
  { id: "colonial", label: "Colonial Heritage", icon: Landmark, keywords: ["colonial", "spanish", "fort", "walled"], weight: 1.0 },
  { id: "nature", label: "Natural Wonders", icon: TreePine, keywords: ["unesco", "terraces", "hills", "geological"], weight: 0.9 },
  { id: "adventure", label: "Adventure", icon: Mountain, keywords: ["hiking", "trek", "outdoor"], weight: 0.8 },
  { id: "history", label: "Deep History", icon: Clock, keywords: ["prehistoric", "2,000", "1571", "1572", "1587"], weight: 1.0 },
  { id: "architecture", label: "Architecture", icon: Palette, keywords: ["buttress", "facade", "cobblestone", "triangular"], weight: 0.85 },
  { id: "culture", label: "Living Culture", icon: Star, keywords: ["town", "heritage village", "antique"], weight: 0.75 },
  { id: "coastal", label: "Coastal & Lake", icon: Waves, keywords: ["lake", "sea", "coastal", "boat"], weight: 0.6 },
];

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

interface ScoredPin {
  pin: MapPinType;
  score: number;
  matchPercent: number;
  matchedInterests: string[];
  distanceKm: number | null;
}

function scorePins(
  selectedInterests: string[],
  selectedProvince: string | null,
): ScoredPin[] {
  const maxDistance = 800;

  return mapPins
    .map((pin) => {
      let score = 0;
      const matched: string[] = [];

      if (selectedInterests.length > 0) {
        for (const intId of selectedInterests) {
          const interest = interests.find((i) => i.id === intId);
          if (!interest) continue;

          const categoryMatch = pin.category.toLowerCase().includes(interest.keywords[0]);
          const descMatch = interest.keywords.some(
            (kw) =>
              pin.description.toLowerCase().includes(kw) ||
              pin.name.toLowerCase().includes(kw) ||
              pin.category.toLowerCase().includes(kw),
          );

          if (categoryMatch || descMatch) {
            score += interest.weight;
            matched.push(interest.label);
          }
        }
      } else {
        score = 0.5;
      }

      if (pin.historicalSignificance === "world-heritage") score += 0.3;
      else if (pin.historicalSignificance === "national") score += 0.15;

      if (pin.accessibility.includes("wheelchair")) score += 0.05;
      if (pin.accessibility.includes("guided-tours")) score += 0.05;

      let distanceKm: number | null = null;
      if (selectedProvince) {
        const prov = provinces.find((p) => p.name === selectedProvince);
        if (prov) {
          distanceKm = haversineDistance(prov.center, pin.coords);
          const proximityBonus = Math.max(0, 1 - distanceKm / maxDistance) * 0.6;
          score += proximityBonus;
        }
      } else {
        const distToCenter = haversineDistance([12.88, 121.77], pin.coords);
        const proximityBonus = Math.max(0, 1 - distToCenter / maxDistance) * 0.2;
        score += proximityBonus;
      }

      return { pin, score, matchPercent: 0, matchedInterests: [...new Set(matched)], distanceKm };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, _, arr) => {
      const maxScore = arr[0]?.score ?? 1;
      return { ...item, matchPercent: Math.round((item.score / maxScore) * 100) };
    });
}

const significanceBadge: Record<string, string> = {
  "world-heritage": "World Heritage",
  national: "National",
  regional: "Regional",
  local: "Local",
};

export function SmartRecommendations() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleInterest = useCallback((id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
    setHasSearched(false);
  }, []);

  const results = useMemo(
    () => scorePins(selectedInterests, selectedProvince),
    [selectedInterests, selectedProvince],
  );

  const topResults = useMemo(() => {
    if (!hasSearched) return results.slice(0, 4);
    return results.filter((r) => r.matchPercent > 30).slice(0, 6);
  }, [results, hasSearched]);

  const handleSearch = () => setHasSearched(true);

  const handleReset = () => {
    setSelectedInterests([]);
    setSelectedProvince(null);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      {/* Interest selector */}
      <div>
        <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink-soft">
          <Sparkles size={12} strokeWidth={1.5} className="text-accent" />
          <span>What interests you?</span>
          {selectedInterests.length > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">
              {selectedInterests.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.map((int) => {
            const Icon = int.icon;
            const active = selectedInterests.includes(int.id);
            return (
              <button
                key={int.id}
                onClick={() => toggleInterest(int.id)}
                className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-all duration-300 ${
                  active
                    ? "border-accent bg-accent/10 text-ink shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                    : "border-ink/15 bg-cream text-ink-soft hover:border-accent/40 hover:text-ink"
                }`}
              >
                <Icon
                  size={14}
                  strokeWidth={1.5}
                  className={`transition-colors ${active ? "text-accent" : "text-ink-soft group-hover:text-accent"}`}
                />
                <span>{int.label}</span>
                {active && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location selector */}
      <div>
        <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink-soft">
          <MapPin size={12} strokeWidth={1.5} className="text-accent" />
          <span>Your location or preferred region</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedProvince(null)}
            className={`rounded-full border px-4 py-2 text-xs transition-all duration-300 ${
              selectedProvince === null
                ? "border-accent bg-accent/10 text-ink shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                : "border-ink/15 bg-cream text-ink-soft hover:border-accent/40 hover:text-ink"
            }`}
          >
            Anywhere
          </button>
          {provinces.map((prov) => (
            <button
              key={prov.id}
              onClick={() =>
                setSelectedProvince(selectedProvince === prov.name ? null : prov.name)
              }
              className={`rounded-full border px-4 py-2 text-xs transition-all duration-300 ${
                selectedProvince === prov.name
                  ? "border-accent bg-accent/10 text-ink shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                  : "border-ink/15 bg-cream text-ink-soft hover:border-accent/40 hover:text-ink"
              }`}
            >
              {prov.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 border-y border-ink/10 py-4">
        <button
          onClick={handleSearch}
          disabled={selectedInterests.length === 0}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
            selectedInterests.length > 0
              ? "bg-ink text-primary-foreground hover:bg-accent"
              : "cursor-not-allowed bg-ink/20 text-ink/30"
          }`}
        >
          <Sparkles size={14} strokeWidth={1.5} />
          Find Matches
        </button>
        {(selectedInterests.length > 0 || selectedProvince) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            <RotateCcw size={12} strokeWidth={1.5} />
            Reset
          </button>
        )}
        <div className="ml-auto font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          {topResults.length} {topResults.length === 1 ? "match" : "matches"}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {topResults.map((item, i) => (
            <motion.div
              key={item.pin.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-ink/8 bg-cream shadow-sm transition-all duration-500 hover:border-accent/20 hover:shadow-[0_8px_30px_-10px_rgba(80,120,255,0.12)]"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.pin.image}
                  alt={item.pin.name}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

                {/* Match badge */}
                <div className="absolute right-3 top-3">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 backdrop-blur-md ${
                      item.matchPercent >= 80
                        ? "bg-accent/90 text-primary-foreground"
                        : item.matchPercent >= 50
                          ? "bg-ink/70 text-cream"
                          : "bg-ink/50 text-cream/80"
                    }`}
                  >
                    <Trophy size={10} strokeWidth={2} />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                      {item.matchPercent}% match
                    </span>
                  </div>
                </div>

                {/* Significance badge */}
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">
                    {significanceBadge[item.pin.historicalSignificance] ?? item.pin.historicalSignificance}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-display text-lg leading-tight text-ink">{item.pin.name}</h3>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {item.pin.municipality}, {item.pin.province}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-accent">{item.pin.era}</span>
                </div>

                {/* Matched interests */}
                {item.matchedInterests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.matchedInterests.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-accent/8 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent/80"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-ink-soft">
                      <Accessibility size={10} strokeWidth={1.5} />
                      {item.pin.accessibility.length} modes
                    </span>
                    {item.distanceKm !== null && (
                      <span className="text-[10px] text-ink-soft">
                        {Math.round(item.distanceKm)} km away
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-accent/70 transition-colors group-hover:text-accent">
                    View details
                    <ChevronRight size={10} strokeWidth={2} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {topResults.length === 0 && hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-ink/20 bg-parchment/40 px-8 py-16 text-center"
        >
          <Sparkles size={24} strokeWidth={1.2} className="mx-auto mb-3 text-ink/20" />
          <p className="text-sm text-ink-soft">
            No strong matches found. Try selecting different interests or expanding your region.
          </p>
        </motion.div>
      )}
    </div>
  );
}
