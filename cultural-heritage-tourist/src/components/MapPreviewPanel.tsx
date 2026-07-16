import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Clock, Tag } from "lucide-react";
import type { MapPin as MapPinType } from "@/data/map-pins";

interface MapPreviewPanelProps {
  pin: MapPinType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MapPreviewPanel({ pin, isOpen, onClose }: MapPreviewPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && pin && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute right-0 top-0 z-[1001] h-full w-full max-w-sm"
        >
          <div className="relative h-full overflow-hidden rounded-l-2xl border-l border-ink/10 bg-cream shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.35)]">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-cream/90 text-ink backdrop-blur-sm transition-all hover:bg-ink hover:text-cream"
            >
              <X size={16} strokeWidth={2} />
            </button>

            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={pin.image}
                alt={pin.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">
                {pin.category}
              </span>
            </div>

            {/* Content */}
            <div className="relative px-5 pb-6 pt-2">
              <h3 className="text-display text-2xl leading-tight text-ink">{pin.name}</h3>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin size={12} strokeWidth={2} />
                  {pin.municipality}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <Clock size={12} strokeWidth={2} />
                  {pin.era}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <Tag size={12} strokeWidth={2} />
                  {pin.category}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{pin.description}</p>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 rounded-xl bg-ink px-4 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-accent">
                  View Route
                </button>
                <button className="flex-1 rounded-xl border border-ink/20 px-4 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent">
                  Bookmark
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-parchment/60 p-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  Coordinates
                </span>
                <p className="mt-1 font-mono text-xs text-ink">
                  {pin.coords[0].toFixed(4)}°N, {pin.coords[1].toFixed(4)}°E
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
