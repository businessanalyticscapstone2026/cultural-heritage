import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, ChevronDown, X, Accessibility, Landmark, MapPin, Star } from "lucide-react";
import type { AccessibilityLevel, SignificanceLevel } from "@/data/map-pins";

export interface FilterState {
  municipality: string;
  accessibility: AccessibilityLevel[];
  historicalSignificance: SignificanceLevel[];
  nearbyAttractions: string;
}

interface AdvancedFiltersProps {
  municipalities: string[];
  attractionNames: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

const accessibilityOptions: { value: AccessibilityLevel; label: string }[] = [
  { value: "wheelchair", label: "Wheelchair" },
  { value: "guided-tours", label: "Guided Tours" },
  { value: "self-guided", label: "Self-Guided" },
  { value: "hiking-required", label: "Hiking Required" },
  { value: "boat-access", label: "Boat Access" },
];

const significanceOptions: { value: SignificanceLevel; label: string }[] = [
  { value: "world-heritage", label: "World Heritage" },
  { value: "national", label: "National" },
  { value: "regional", label: "Regional" },
  { value: "local", label: "Local" },
];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
        active
          ? "border-accent bg-accent/15 text-ink shadow-sm"
          : "border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Icon size={12} strokeWidth={1.5} className="text-ink-soft" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function AdvancedFilters({
  municipalities,
  attractionNames,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.municipality !== "all" ||
    filters.accessibility.length > 0 ||
    filters.historicalSignificance.length > 0 ||
    filters.nearbyAttractions !== "";

  const activeCount =
    (filters.municipality !== "all" ? 1 : 0) +
    filters.accessibility.length +
    filters.historicalSignificance.length +
    (filters.nearbyAttractions !== "" ? 1 : 0);

  const toggleAccessibility = (level: AccessibilityLevel) => {
    const next = filters.accessibility.includes(level)
      ? filters.accessibility.filter((a) => a !== level)
      : [...filters.accessibility, level];
    onFiltersChange({ ...filters, accessibility: next });
  };

  const toggleSignificance = (level: SignificanceLevel) => {
    const next = filters.historicalSignificance.includes(level)
      ? filters.historicalSignificance.filter((s) => s !== level)
      : [...filters.historicalSignificance, level];
    onFiltersChange({ ...filters, historicalSignificance: next });
  };

  const clearAll = () => {
    onFiltersChange({
      municipality: "all",
      accessibility: [],
      historicalSignificance: [],
      nearbyAttractions: "",
    });
  };

  return (
    <div className="absolute right-4 top-4 z-[1000]">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 backdrop-blur-md transition-all ${
          hasActiveFilters
            ? "border-accent/50 bg-cream/95 text-ink shadow-md"
            : "border-ink/10 bg-cream/95 text-ink-soft shadow-lg hover:border-ink/25 hover:text-ink"
        }`}
      >
        <SlidersHorizontal size={14} strokeWidth={1.5} />
        <span className="font-mono text-[10px] uppercase tracking-widest">Filters</span>
        {hasActiveFilters && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] text-primary-foreground">
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Filter panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-ink/10 bg-cream shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                Advanced Filters
              </span>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="font-mono text-[10px] uppercase tracking-wider text-accent transition-colors hover:text-accent"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-6 w-6 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Filter sections */}
            <div className="space-y-5 p-4">
              {/* Municipality */}
              <FilterSection icon={MapPin} title="Municipality">
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="All"
                    active={filters.municipality === "all"}
                    onClick={() => onFiltersChange({ ...filters, municipality: "all" })}
                  />
                  {municipalities.map((m) => (
                    <FilterChip
                      key={m}
                      label={m}
                      active={filters.municipality === m}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          municipality: filters.municipality === m ? "all" : m,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Accessibility */}
              <FilterSection icon={Accessibility} title="Accessibility">
                <div className="flex flex-wrap gap-1.5">
                  {accessibilityOptions.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      active={filters.accessibility.includes(opt.value)}
                      onClick={() => toggleAccessibility(opt.value)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Historical Significance */}
              <FilterSection icon={Landmark} title="Historical Significance">
                <div className="flex flex-wrap gap-1.5">
                  {significanceOptions.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      active={filters.historicalSignificance.includes(opt.value)}
                      onClick={() => toggleSignificance(opt.value)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Nearby Attractions */}
              <FilterSection icon={Star} title="Nearby Attraction">
                <div className="relative">
                  <input
                    type="text"
                    value={filters.nearbyAttractions}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, nearbyAttractions: e.target.value })
                    }
                    placeholder="Search attractions..."
                    className="w-full rounded-lg border border-ink/10 bg-background px-3 py-2 font-mono text-xs text-ink placeholder:text-ink-soft/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                  />
                  {filters.nearbyAttractions && (
                    <button
                      onClick={() => onFiltersChange({ ...filters, nearbyAttractions: "" })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-md text-ink-soft transition-colors hover:text-ink"
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  )}
                </div>
                {filters.nearbyAttractions && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {attractionNames
                      .filter((a) =>
                        a.toLowerCase().includes(filters.nearbyAttractions.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((a) => (
                        <span
                          key={a}
                          className="rounded-md bg-parchment/60 px-2 py-0.5 font-mono text-[9px] text-ink-soft"
                        >
                          {a}
                        </span>
                      ))}
                  </div>
                )}
              </FilterSection>
            </div>

            {/* Results bar */}
            <div className="border-t border-ink/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  {resultCount} of {totalCount} sites
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[10px] text-ink-soft">live</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
