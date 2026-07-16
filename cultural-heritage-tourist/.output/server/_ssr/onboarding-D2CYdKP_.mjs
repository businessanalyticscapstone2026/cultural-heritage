import { a as __toESM } from "../_runtime.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { C as Music, D as MapPin, F as GraduationCap, P as Heart, Q as Accessibility, S as Navigation, V as Church, X as BookOpen, a as TreePine, i as User, j as Landmark, n as Waves, r as Users, w as Mountain, x as Palette } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./auth-D2gWtNPt.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-D2CYdKP_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var interestOptions = [
	{
		id: "colonial",
		label: "Colonial Architecture",
		icon: Landmark,
		description: "Spanish-era houses, plazas, and fortifications"
	},
	{
		id: "sacred",
		label: "Sacred Sites",
		icon: Church,
		description: "Historic churches, basilicas, and shrines"
	},
	{
		id: "nature",
		label: "Natural Heritage",
		icon: TreePine,
		description: "Terraces, parks, and geological wonders"
	},
	{
		id: "art",
		label: "Art & Craft",
		icon: Palette,
		description: "Traditional weaving, pottery, and visual arts"
	},
	{
		id: "music",
		label: "Living Culture",
		icon: Music,
		description: "Festivals, dances, and musical traditions"
	},
	{
		id: "stories",
		label: "Stories & Lore",
		icon: BookOpen,
		description: "Local legends, oral histories, and folklore"
	},
	{
		id: "adventure",
		label: "Outdoor Trekking",
		icon: Mountain,
		description: "Hiking trails, peaks, and mountain communities"
	},
	{
		id: "coastal",
		label: "Coastal Heritage",
		icon: Waves,
		description: "Beaches, fishing villages, and maritime history"
	}
];
var travelStyles = [
	{
		id: "solo",
		label: "Solo",
		icon: User,
		desc: "Discover at your own pace"
	},
	{
		id: "couple",
		label: "Couple",
		icon: Heart,
		desc: "Share the journey with a partner"
	},
	{
		id: "family",
		label: "Family",
		icon: Users,
		desc: "Kid-friendly heritage adventures"
	},
	{
		id: "friends",
		label: "Friends",
		icon: Users,
		desc: "Group explorations and shared memories"
	},
	{
		id: "educational",
		label: "Educational Tour",
		icon: GraduationCap,
		desc: "Learn-focused guided experiences"
	}
];
var accessibilityOptions = [
	{
		id: "wheelchair",
		label: "Wheelchair Accessible",
		desc: "Ramps, elevators, and step-free routes"
	},
	{
		id: "family",
		label: "Family-Friendly",
		desc: "Stroller-friendly and child-safe areas"
	},
	{
		id: "senior",
		label: "Senior-Friendly",
		desc: "Minimal walking, rest areas available"
	},
	{
		id: "none",
		label: "No Preference",
		desc: "I have no specific accessibility needs"
	}
];
var distanceOptions = [
	{
		id: "nearby",
		label: "Within Walking Distance",
		desc: "Sites within 2 km"
	},
	{
		id: "municipality",
		label: "Within Municipality",
		desc: "Same town or city"
	},
	{
		id: "province",
		label: "Within the Province",
		desc: "Up to 30 km away"
	},
	{
		id: "anywhere",
		label: "Anywhere",
		desc: "No distance limit"
	}
];
var TOTAL_STEPS = 6;
function OnboardingFlow() {
	const { completeOnboarding } = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(0);
	const [selectedInterests, setSelectedInterests] = (0, import_react.useState)([]);
	const [travelStyle, setTravelStyle] = (0, import_react.useState)(null);
	const [accessibilityPrefs, setAccessibilityPrefs] = (0, import_react.useState)([]);
	const [travelDistance, setTravelDistance] = (0, import_react.useState)(null);
	const [locationEnabled, setLocationEnabled] = (0, import_react.useState)(null);
	const toggleInterest = (id) => setSelectedInterests((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
	const toggleAccessibility = (id) => setAccessibilityPrefs((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
	const handleFinish = () => {
		completeOnboarding({
			interests: selectedInterests,
			travelStyle: travelStyle ?? void 0,
			accessibilityPrefs: accessibilityPrefs.length ? accessibilityPrefs : void 0,
			travelDistance: travelDistance ?? void 0,
			locationEnabled: locationEnabled ?? void 0
		});
		navigate({ to: "/home" });
	};
	const progress = Math.round(step / TOTAL_STEPS * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-2xl",
			children: [step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs text-ink-soft mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Step ",
						step,
						" of ",
						TOTAL_STEPS
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [progress, "%"] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 w-full rounded-full bg-ink/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						className: "h-full rounded-full bg-accent",
						initial: { width: 0 },
						animate: { width: `${progress}%` },
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						}
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatePresence, {
				mode: "wait",
				children: [
					step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									width: "32",
									height: "32",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-display text-4xl leading-tight text-ink md:text-5xl",
								children: ["Welcome to ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "italic text-accent",
									children: "Patrimonio"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-4 max-w-md text-ink-soft",
								children: "Let's personalize your experience. We'll ask a few questions to curate heritage recommendations just for you."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStep(1),
								className: "mt-10 rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
								children: "Let's go"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/home",
									className: "text-xs text-ink-soft hover:text-ink",
									children: "Skip for now →"
								})
							})
						]
					}, "welcome"),
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-display text-3xl text-ink md:text-4xl",
									children: ["Pick your ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "interests"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-ink-soft",
									children: "Select at least 3 to personalize your feed."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
								children: interestOptions.map((interest) => {
									const Icon = interest.icon;
									const active = selectedInterests.includes(interest.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => toggleInterest(interest.id),
										className: `group relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all ${active ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]" : "border-ink/10 bg-cream hover:border-ink/25"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `grid h-12 w-12 place-items-center rounded-full border transition-all ${active ? "border-accent bg-accent text-primary-foreground" : "border-ink/15 bg-background text-accent group-hover:border-accent"}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
													size: 20,
													strokeWidth: 1.4
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `block text-xs font-medium ${active ? "text-ink" : "text-ink-soft"}`,
												children: interest.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-[10px] text-ink-soft/70",
												children: interest.description
											})] }),
											active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute right-2 top-2 h-5 w-5 rounded-full bg-accent text-[10px] text-primary-foreground grid place-items-center",
												children: "✓"
											})
										]
									}, interest.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(0),
									className: "text-sm text-ink-soft hover:text-ink",
									children: "← Back"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setStep(2),
									disabled: selectedInterests.length < 3,
									className: "rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed",
									children: [
										"Continue (",
										selectedInterests.length,
										"/3+)"
									]
								})]
							})
						]
					}, "interests"),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-display text-3xl text-ink md:text-4xl",
									children: [
										"How do you ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
											className: "italic text-accent",
											children: "travel"
										}),
										"?"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-ink-soft",
									children: "Select the option that best describes you."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: travelStyles.map((style) => {
									const Icon = style.icon;
									const active = travelStyle === style.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setTravelStyle(style.id),
										className: `flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${active ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]" : "border-ink/10 bg-cream hover:border-ink/25"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all ${active ? "border-accent bg-accent text-primary-foreground" : "border-ink/15 bg-background text-accent"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												size: 20,
												strokeWidth: 1.4
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `block text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`,
											children: style.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-ink-soft/70",
											children: style.desc
										})] })]
									}, style.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(1),
									className: "text-sm text-ink-soft hover:text-ink",
									children: "← Back"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(3),
									disabled: !travelStyle,
									className: "rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed",
									children: "Continue"
								})]
							})
						]
					}, "travel"),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, {
											size: 28,
											strokeWidth: 1.4
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-display text-3xl text-ink md:text-4xl",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
											className: "italic text-accent",
											children: "Accessibility"
										}), " preferences"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-ink-soft",
										children: "Select any accessibility needs (optional)."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: accessibilityOptions.map((opt) => {
									const active = accessibilityPrefs.includes(opt.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => toggleAccessibility(opt.id),
										className: `flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${active ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]" : "border-ink/10 bg-cream hover:border-ink/25"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all ${active ? "border-accent bg-accent text-primary-foreground" : "border-ink/15 bg-background text-accent"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, {
												size: 20,
												strokeWidth: 1.4
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `block text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`,
											children: opt.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-ink-soft/70",
											children: opt.desc
										})] })]
									}, opt.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(2),
									className: "text-sm text-ink-soft hover:text-ink",
									children: "← Back"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(4),
									className: "rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
									children: "Continue"
								})]
							})
						]
					}, "accessibility"),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
											size: 28,
											strokeWidth: 1.4
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-display text-3xl text-ink md:text-4xl",
										children: ["Preferred ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
											className: "italic text-accent",
											children: "travel distance"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-ink-soft",
										children: "How far are you willing to travel for heritage sites?"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: distanceOptions.map((opt) => {
									const active = travelDistance === opt.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setTravelDistance(opt.id),
										className: `flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${active ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(80,120,255,0.08)]" : "border-ink/10 bg-cream hover:border-ink/25"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all ${active ? "border-accent bg-accent text-primary-foreground" : "border-ink/15 bg-background text-accent"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												size: 20,
												strokeWidth: 1.4
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `block text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`,
											children: opt.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-ink-soft/70",
											children: opt.desc
										})] })]
									}, opt.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(3),
									className: "text-sm text-ink-soft hover:text-ink",
									children: "← Back"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep(5),
									disabled: !travelDistance,
									className: "rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed",
									children: "Continue"
								})]
							})
						]
					}, "distance"),
					step === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
									size: 32,
									strokeWidth: 1.2
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-display text-3xl text-ink md:text-4xl",
								children: [
									"Enable ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "location"
									}),
									"?"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-4 max-w-md text-sm text-ink-soft",
								children: "Allow Patrimonio to use your location for nearby heritage site recommendations and real-time distance estimates."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-10 flex items-center justify-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setLocationEnabled(true);
										setStep(6);
									},
									className: "rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
									children: "Allow Location"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setLocationEnabled(false);
										setStep(6);
									},
									className: "rounded-full border border-ink/25 px-8 py-3 text-sm text-ink transition-colors hover:border-ink",
									children: "Skip for now"
								})]
							})
						]
					}, "location"),
					step === 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -20
						},
						transition: {
							duration: .5,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full border border-accent bg-accent/10 text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									width: "36",
									height: "36",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 6 9 17l-5-5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-display text-4xl leading-tight text-ink md:text-5xl",
								children: [
									"You're ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "all set"
									}),
									"!"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-4 max-w-md text-ink-soft",
								children: "Your personalized heritage feed is ready. We'll recommend sites based on your interests, travel style, and accessibility needs."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 rounded-2xl border border-ink/10 bg-cream p-6 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium text-ink mb-3",
									children: "Your preferences:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										selectedInterests.map((id) => {
											const opt = interestOptions.find((i) => i.id === id);
											return opt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-accent/10 px-3 py-1 text-xs text-accent",
												children: opt.label
											}, id) : null;
										}),
										travelStyle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-accent/10 px-3 py-1 text-xs text-accent",
											children: travelStyles.find((s) => s.id === travelStyle)?.label
										}),
										accessibilityPrefs.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-accent/10 px-3 py-1 text-xs text-accent",
											children: accessibilityOptions.find((a) => a.id === id)?.label
										}, id)),
										travelDistance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-accent/10 px-3 py-1 text-xs text-accent",
											children: distanceOptions.find((d) => d.id === travelDistance)?.label
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleFinish,
								className: "mt-10 rounded-full bg-ink px-10 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
								children: "Start exploring →"
							})
						]
					}, "finish")
				]
			})]
		})
	});
}
function OnboardingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingFlow, {});
}
//#endregion
export { OnboardingPage as component };
