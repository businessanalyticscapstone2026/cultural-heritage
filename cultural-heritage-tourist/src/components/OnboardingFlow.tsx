import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Church, Landmark, TreePine, Palette, Music, BookOpen, Mountain, Waves,
  User, Heart, Users, GraduationCap, MapPin, Accessibility, Navigation,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { TravelStyle, AccessibilityPref, TravelDistance } from "@/lib/auth";
import { Link, useNavigate } from "@tanstack/react-router";

const interestOptions = [
  { id: "colonial", label: "Colonial Architecture", icon: Landmark, description: "Spanish-era houses, plazas, and fortifications" },
  { id: "sacred", label: "Sacred Sites", icon: Church, description: "Historic churches, basilicas, and shrines" },
  { id: "nature", label: "Natural Heritage", icon: TreePine, description: "Terraces, parks, and geological wonders" },
  { id: "art", label: "Art & Craft", icon: Palette, description: "Traditional weaving, pottery, and visual arts" },
  { id: "music", label: "Living Culture", icon: Music, description: "Festivals, dances, and musical traditions" },
  { id: "stories", label: "Stories & Lore", icon: BookOpen, description: "Local legends, oral histories, and folklore" },
  { id: "adventure", label: "Outdoor Trekking", icon: Mountain, description: "Hiking trails, peaks, and mountain communities" },
  { id: "coastal", label: "Coastal Heritage", icon: Waves, description: "Beaches, fishing villages, and maritime history" },
];

const travelStyles: { id: TravelStyle; label: string; icon: typeof User; desc: string }[] = [
  { id: "solo", label: "Solo", icon: User, desc: "Discover at your own pace" },
  { id: "couple", label: "Couple", icon: Heart, desc: "Share the journey with a partner" },
  { id: "family", label: "Family", icon: Users, desc: "Kid-friendly heritage adventures" },
  { id: "friends", label: "Friends", icon: Users, desc: "Group explorations and shared memories" },
  { id: "educational", label: "Educational Tour", icon: GraduationCap, desc: "Learn-focused guided experiences" },
];

const accessibilityOptions: { id: AccessibilityPref; label: string; desc: string }[] = [
  { id: "wheelchair", label: "Wheelchair Accessible", desc: "Ramps, elevators, and step-free routes" },
  { id: "family", label: "Family-Friendly", desc: "Stroller-friendly and child-safe areas" },
  { id: "senior", label: "Senior-Friendly", desc: "Minimal walking, rest areas available" },
  { id: "none", label: "No Preference", desc: "I have no specific accessibility needs" },
];

const distanceOptions: { id: TravelDistance; label: string; desc: string }[] = [
  { id: "nearby", label: "Within Walking Distance", desc: "Sites within 2 km" },
  { id: "municipality", label: "Within Municipality", desc: "Same town or city" },
  { id: "province", label: "Within the Province", desc: "Up to 30 km away" },
  { id: "anywhere", label: "Anywhere", desc: "No distance limit" },
];

const TOTAL_STEPS = 6;

export function OnboardingFlow() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState<AccessibilityPref[]>([]);
  const [travelDistance, setTravelDistance] = useState<TravelDistance | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);

  const toggleInterest = (id: string) =>
    setSelectedInterests((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));

  const toggleAccessibility = (id: AccessibilityPref) =>
    setAccessibilityPrefs((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));

  const handleFinish = () => {
    completeOnboarding({
      interests: selectedInterests,
      travelStyle: travelStyle ?? undefined,
      accessibilityPrefs: accessibilityPrefs.length ? accessibilityPrefs : undefined,
      travelDistance: travelDistance ?? undefined,
      locationEnabled: locationEnabled ?? undefined,
    });
    navigate({ to: "/home" });
  };

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        {step > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-ink-soft mb-2">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink/10">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" />
                </svg>
              </div>
              <h1 className="text-display text-4xl leading-tight text-ink md:text-5xl">
                Welcome to <em className="italic text-accent">Batangas Heritage</em>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-ink-soft">
                Let&apos;s personalize your experience. We&apos;ll ask a few questions
                to curate heritage recommendations just for you.
              </p>
              <button
                onClick={() => setStep(1)}
                className="mt-10 rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
              >
                Let&apos;s go
              </button>
              <div className="mt-6">
                <Link to="/home" className="text-xs text-ink-soft hover:text-ink">Skip for now →</Link>
              </div>
            </motion.div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 text-center">
                <h2 className="text-display text-3xl text-ink md:text-4xl">
                  Pick your <em className="italic text-accent">interests</em>
                </h2>
                <p className="mt-2 text-sm text-ink-soft">Select at least 3 to personalize your feed.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {interestOptions.map((interest) => {
                  const Icon = interest.icon;
                  const active = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all ${
                        active
                          ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                          : "border-ink/10 bg-cream hover:border-ink/25"
                      }`}
                    >
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-full border transition-all ${
                          active
                            ? "border-accent bg-accent text-primary-foreground"
                            : "border-ink/15 bg-background text-accent group-hover:border-accent"
                        }`}
                      >
                        <Icon size={20} strokeWidth={1.4} />
                      </span>
                      <div>
                        <span className={`block text-xs font-medium ${active ? "text-ink" : "text-ink-soft"}`}>
                          {interest.label}
                        </span>
                        <span className="mt-1 block text-[10px] text-ink-soft/70">{interest.description}</span>
                      </div>
                      {active && (
                        <span className="absolute right-2 top-2 h-5 w-5 rounded-full bg-accent text-[10px] text-primary-foreground grid place-items-center">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep(0)} className="text-sm text-ink-soft hover:text-ink">← Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedInterests.length < 3}
                  className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue ({selectedInterests.length}/3+)
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Travel Style */}
          {step === 2 && (
            <motion.div
              key="travel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 text-center">
                <h2 className="text-display text-3xl text-ink md:text-4xl">
                  How do you <em className="italic text-accent">travel</em>?
                </h2>
                <p className="mt-2 text-sm text-ink-soft">Select the option that best describes you.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {travelStyles.map((style) => {
                  const Icon = style.icon;
                  const active = travelStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setTravelStyle(style.id)}
                      className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                        active
                          ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                          : "border-ink/10 bg-cream hover:border-ink/25"
                      }`}
                    >
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all ${
                          active
                            ? "border-accent bg-accent text-primary-foreground"
                            : "border-ink/15 bg-background text-accent"
                        }`}
                      >
                        <Icon size={20} strokeWidth={1.4} />
                      </span>
                      <div>
                        <span className={`block text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`}>
                          {style.label}
                        </span>
                        <span className="block text-xs text-ink-soft/70">{style.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-ink-soft hover:text-ink">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!travelStyle}
                  className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Accessibility */}
          {step === 3 && (
            <motion.div
              key="accessibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent">
                  <Accessibility size={28} strokeWidth={1.4} />
                </div>
                <h2 className="text-display text-3xl text-ink md:text-4xl">
                  <em className="italic text-accent">Accessibility</em> preferences
                </h2>
                <p className="mt-2 text-sm text-ink-soft">Select any accessibility needs (optional).</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {accessibilityOptions.map((opt) => {
                  const active = accessibilityPrefs.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleAccessibility(opt.id)}
                      className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                        active
                          ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                          : "border-ink/10 bg-cream hover:border-ink/25"
                      }`}
                    >
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all ${
                          active
                            ? "border-accent bg-accent text-primary-foreground"
                            : "border-ink/15 bg-background text-accent"
                        }`}
                      >
                        <Accessibility size={20} strokeWidth={1.4} />
                      </span>
                      <div>
                        <span className={`block text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`}>
                          {opt.label}
                        </span>
                        <span className="block text-xs text-ink-soft/70">{opt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep(2)} className="text-sm text-ink-soft hover:text-ink">← Back</button>
                <button
                  onClick={() => setStep(4)}
                  className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Travel Distance */}
          {step === 4 && (
            <motion.div
              key="distance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent">
                  <Navigation size={28} strokeWidth={1.4} />
                </div>
                <h2 className="text-display text-3xl text-ink md:text-4xl">
                  Preferred <em className="italic text-accent">travel distance</em>
                </h2>
                <p className="mt-2 text-sm text-ink-soft">How far are you willing to travel for heritage sites?</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {distanceOptions.map((opt) => {
                  const active = travelDistance === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTravelDistance(opt.id)}
                      className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                        active
                          ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]"
                          : "border-ink/10 bg-cream hover:border-ink/25"
                      }`}
                    >
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all ${
                          active
                            ? "border-accent bg-accent text-primary-foreground"
                            : "border-ink/15 bg-background text-accent"
                        }`}
                      >
                        <MapPin size={20} strokeWidth={1.4} />
                      </span>
                      <div>
                        <span className={`block text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`}>
                          {opt.label}
                        </span>
                        <span className="block text-xs text-ink-soft/70">{opt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep(3)} className="text-sm text-ink-soft hover:text-ink">← Back</button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!travelDistance}
                  className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Location */}
          {step === 5 && (
            <motion.div
              key="location"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent">
                <MapPin size={32} strokeWidth={1.2} />
              </div>
              <h2 className="text-display text-3xl text-ink md:text-4xl">
                Enable <em className="italic text-accent">location</em>?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
                Allow Batangas Heritage to use your location for nearby heritage site
                recommendations and real-time distance estimates.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => { setLocationEnabled(true); setStep(6); }}
                  className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
                >
                  Allow Location
                </button>
                <button
                  onClick={() => { setLocationEnabled(false); setStep(6); }}
                  className="rounded-full border border-ink/25 px-8 py-3 text-sm text-ink transition-colors hover:border-ink"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Finish */}
          {step === 6 && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full border border-accent bg-accent/10 text-accent">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 className="text-display text-4xl leading-tight text-ink md:text-5xl">
                You&apos;re <em className="italic text-accent">all set</em>!
              </h1>
              <p className="mx-auto mt-4 max-w-md text-ink-soft">
                Your personalized heritage feed is ready. We&apos;ll recommend sites
                based on your interests, travel style, and accessibility needs.
              </p>
              <div className="mt-8 rounded-2xl border border-ink/10 bg-cream p-6 text-left">
                <h3 className="text-sm font-medium text-ink mb-3">Your preferences:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((id) => {
                    const opt = interestOptions.find((i) => i.id === id);
                    return opt ? (
                      <span key={id} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">{opt.label}</span>
                    ) : null;
                  })}
                  {travelStyle && (
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                      {travelStyles.find((s) => s.id === travelStyle)?.label}
                    </span>
                  )}
                  {accessibilityPrefs.map((id) => (
                    <span key={id} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                      {accessibilityOptions.find((a) => a.id === id)?.label}
                    </span>
                  ))}
                  {travelDistance && (
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                      {distanceOptions.find((d) => d.id === travelDistance)?.label}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleFinish}
                className="mt-10 rounded-full bg-ink px-10 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
              >
                Start exploring →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
