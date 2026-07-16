import { a as __toESM } from "../_runtime.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { A as Locate, B as Clock, D as MapPin, G as ChevronDown, H as ChevronUp, K as Car, L as Footprints, S as Navigation, U as ChevronRight, _ as RotateCcw, g as Route, h as Ruler, o as Trash2, p as Search, t as X, v as Plus } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Navbar } from "./Navbar-B_GQDJPv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-jFQL3i0z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var InteractiveMap = (0, import_react.lazy)(() => import("./InteractiveMap-C6KT29rA.mjs").then((m) => ({ default: m.InteractiveMap })));
var allSites = [
	{
		id: "basilica-martin",
		name: "Basilica of St. Martin de Tours",
		municipality: "Balayan",
		category: "Sacred",
		img: "/dest-1.jpg"
	},
	{
		id: "balayan-heritage-houses",
		name: "Balayan Heritage Houses",
		municipality: "Balayan",
		category: "Colonial",
		img: "/dest-2.jpg"
	},
	{
		id: "calatagan-archaeological",
		name: "Calatagan Archaeological Site",
		municipality: "Calatagan",
		category: "UNESCO",
		img: "/dest-4.jpg"
	},
	{
		id: "calatagan-ruins",
		name: "Calatagan Ruins",
		municipality: "Calatagan",
		category: "Colonial",
		img: "/dest-2.jpg"
	},
	{
		id: "lian-church",
		name: "Lian Church",
		municipality: "Lian",
		category: "Sacred",
		img: "/dest-1.jpg"
	},
	{
		id: "nasugbu-church",
		name: "Our Lady of the Assumption",
		municipality: "Nasugbu",
		category: "Sacred",
		img: "/dest-4.jpg"
	},
	{
		id: "fortune-island",
		name: "Fortune Island Ruins",
		municipality: "Nasugbu",
		category: "Colonial",
		img: "/dest-3.jpg"
	},
	{
		id: "tuy-church",
		name: "San Jose Parish Church",
		municipality: "Tuy",
		category: "Sacred",
		img: "/dest-1.jpg"
	},
	{
		id: "gulod-nature",
		name: "Gulod National Park",
		municipality: "Tuy",
		category: "Natural",
		img: "/dest-3.jpg"
	},
	{
		id: "malaruhatan-fort",
		name: "Malaruhatan Watchtower",
		municipality: "Lian",
		category: "Colonial",
		img: "/dest-4.jpg"
	}
];
var DISTANCE_MATRIX = {
	"balayan": {
		"balayan": 0,
		"calatagan": 18,
		"lian": 12,
		"nasugbu": 28,
		"tuy": 22
	},
	"calatagan": {
		"balayan": 18,
		"calatagan": 0,
		"lian": 25,
		"nasugbu": 35,
		"tuy": 30
	},
	"lian": {
		"balayan": 12,
		"calatagan": 25,
		"lian": 0,
		"nasugbu": 15,
		"tuy": 18
	},
	"nasugbu": {
		"balayan": 28,
		"calatagan": 35,
		"lian": 15,
		"nasugbu": 0,
		"tuy": 20
	},
	"tuy": {
		"balayan": 22,
		"calatagan": 30,
		"lian": 18,
		"nasugbu": 20,
		"tuy": 0
	}
};
function getDistance(from, to) {
	const a = from.toLowerCase();
	const b = to.toLowerCase();
	return DISTANCE_MATRIX[a]?.[b] ?? 15;
}
function computeRoute(stops) {
	if (stops.length < 2) return {
		totalKm: 0,
		duration: "0 min"
	};
	let total = 0;
	for (let i = 0; i < stops.length - 1; i++) total += getDistance(stops[i].municipality, stops[i + 1].municipality);
	const hours = Math.floor(total / 40);
	const mins = Math.round((total / 40 - hours) * 60) + stops.length * 15;
	const totalMin = hours * 60 + mins;
	const h = Math.floor(totalMin / 60);
	const m = totalMin % 60;
	return {
		totalKm: total,
		duration: h > 0 ? `${h}h ${m}m` : `${m} min`
	};
}
function openNavigation(stops, mode) {
	if (stops.length === 0) return;
	if (stops.length === 1) {
		window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stops[0].name + ", " + stops[0].municipality + ", Batangas")}&travelmode=${mode}`, "_blank");
		return;
	}
	const origin = `${stops[0].name}, ${stops[0].municipality}, Batangas`;
	const dest = `${stops[stops.length - 1].name}, ${stops[stops.length - 1].municipality}, Batangas`;
	const waypoints = stops.slice(1, -1).map((s) => `${s.name}, ${s.municipality}, Batangas`).join("|");
	const params = new URLSearchParams({
		api: "1",
		origin,
		destination: dest,
		travelmode: mode
	});
	if (waypoints) params.set("waypoints", waypoints);
	window.open(`https://www.google.com/maps/dir/?${params.toString()}`, "_blank");
}
function MapPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [showNearby, setShowNearby] = (0, import_react.useState)(false);
	const [destSelect, setDestSelect] = (0, import_react.useState)("");
	const [travelMode, setTravelMode] = (0, import_react.useState)("car");
	const [optimized, setOptimized] = (0, import_react.useState)(null);
	const [showRouteResult, setShowRouteResult] = (0, import_react.useState)(false);
	const [tourStops, setTourStops] = (0, import_react.useState)([]);
	const [showTour, setShowTour] = (0, import_react.useState)(false);
	const [addToTourQuery, setAddToTourQuery] = (0, import_react.useState)("");
	const [showAddDropdown, setShowAddDropdown] = (0, import_react.useState)(false);
	const filteredPins = search ? allSites.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.municipality.toLowerCase().includes(search.toLowerCase())) : allSites;
	const addableSites = addToTourQuery ? allSites.filter((p) => !tourStops.some((t) => t.id === p.id) && (p.name.toLowerCase().includes(addToTourQuery.toLowerCase()) || p.municipality.toLowerCase().includes(addToTourQuery.toLowerCase()))) : allSites.filter((p) => !tourStops.some((t) => t.id === p.id));
	const tourRoute = computeRoute(tourStops);
	const handleOptimize = (0, import_react.useCallback)(() => {
		if (!destSelect) return;
		const site = allSites.find((s) => s.id === destSelect);
		if (!site) return;
		setOptimized({
			km: getDistance("Balayan", site.municipality) + 5,
			duration: travelMode === "car" ? "35 min" : "2h 10m"
		});
		setShowRouteResult(true);
	}, [destSelect, travelMode]);
	const handleOptimizeTour = (0, import_react.useCallback)(() => {
		if (tourStops.length < 2) return;
		const sorted = [...tourStops].sort((a, b) => {
			return getDistance("Balayan", a.municipality) - getDistance("Balayan", b.municipality);
		});
		setTourStops(sorted);
		const r = computeRoute(sorted);
		setOptimized({
			km: r.totalKm,
			duration: r.duration
		});
		setShowRouteResult(true);
	}, [tourStops]);
	const addToTour = (site) => {
		setTourStops((prev) => [...prev, site]);
		setAddToTourQuery("");
		setShowAddDropdown(false);
	};
	const removeFromTour = (id) => {
		setTourStops((prev) => prev.filter((s) => s.id !== id));
		setShowRouteResult(false);
		setOptimized(null);
	};
	const moveStop = (index, direction) => {
		setTourStops((prev) => {
			const next = [...prev];
			const target = index + direction;
			if (target < 0 || target >= next.length) return prev;
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-screen w-screen overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full w-full pt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full w-full items-center justify-center bg-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-[0.3em] text-cream/60",
							children: "Loading map..."
						})
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InteractiveMap, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-1/2 top-[4.5rem] z-[1000] w-full max-w-md -translate-x-1/2 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							size: 16,
							strokeWidth: 1.5,
							className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Search destinations...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "w-full rounded-2xl border border-ink/10 bg-cream/95 py-2.5 pl-10 pr-10 text-sm text-ink shadow-lg backdrop-blur-sm outline-none placeholder:text-ink-soft/60 focus:border-accent/40"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							className: "absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 })
						})
					]
				}), search && filteredPins.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 max-h-60 overflow-y-auto rounded-2xl border border-ink/10 bg-cream/95 shadow-lg backdrop-blur-sm",
					children: filteredPins.map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/heritage/$id",
						params: { id: pin.id },
						className: "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-parchment/50 first:rounded-t-2xl last:rounded-b-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								size: 14,
								className: "shrink-0 text-accent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-ink truncate",
									children: pin.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-ink-soft",
									children: [
										pin.municipality,
										" · ",
										pin.category
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								size: 14,
								className: "shrink-0 text-ink-soft"
							})
						]
					}, pin.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto absolute left-4 top-[14rem] z-[1000] flex max-h-[calc(100vh-16rem)] flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-xs rounded-2xl border border-ink/10 bg-cream/90 px-5 py-4 shadow-lg backdrop-blur-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-display text-lg leading-tight text-ink",
							children: "Interactive GIS Atlas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-ink-soft",
							children: "Explore heritage sites across Batangas 1st District."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setShowTour(!showTour);
								setShowNearby(false);
							},
							className: `flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-all ${showTour ? "border border-accent/40 bg-accent/10 text-accent" : "border border-ink/10 bg-cream/90 text-ink-soft hover:text-ink"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { size: 14 }), "Routes"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setShowNearby(!showNearby);
								setShowTour(false);
							},
							className: `flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-all ${showNearby ? "border border-accent/40 bg-accent/10 text-accent" : "border border-ink/10 bg-cream/90 text-ink-soft hover:text-ink"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Locate, { size: 14 }), "Nearby"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showTour && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							x: -20
						},
						animate: {
							opacity: 1,
							x: 0
						},
						exit: {
							opacity: 0,
							x: -20
						},
						transition: { duration: .3 },
						className: "w-72 rounded-2xl border border-ink/10 bg-cream/95 p-5 shadow-lg backdrop-blur-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-display text-base text-ink",
								children: "Route Optimization"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-[10px] uppercase tracking-widest text-ink-soft",
										children: "Destination"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												size: 14,
												className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: destSelect,
												onChange: (e) => {
													setDestSelect(e.target.value);
													setShowRouteResult(false);
													setOptimized(null);
												},
												className: "w-full appearance-none rounded-xl border border-ink/10 bg-card py-2.5 pl-9 pr-8 text-sm text-ink outline-none focus:border-accent/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Select destination…"
												}), allSites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: s.id,
													children: s.name
												}, s.id))]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
												size: 14,
												className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1.5 block text-[10px] uppercase tracking-widest text-ink-soft",
										children: "Travel Mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setTravelMode("car"),
											className: `flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all ${travelMode === "car" ? "border border-accent/40 bg-accent/10 text-accent" : "border border-ink/10 bg-card text-ink-soft hover:text-ink"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { size: 14 }), "Car"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setTravelMode("walking"),
											className: `flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all ${travelMode === "walking" ? "border border-accent/40 bg-accent/10 text-accent" : "border border-ink/10 bg-card text-ink-soft hover:text-ink"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footprints, { size: 14 }), "Walking"]
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: handleOptimize,
										disabled: !destSelect,
										className: "w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed",
										children: "Optimize Route"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showRouteResult && optimized && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									opacity: 0,
									height: 0
								},
								animate: {
									opacity: 1,
									height: "auto"
								},
								exit: {
									opacity: 0,
									height: 0
								},
								className: "overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 border-t border-ink/10 pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
												size: 14,
												className: "text-accent"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] uppercase tracking-widest text-ink-soft",
												children: "Est. Time"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold text-ink",
												children: optimized.duration
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ruler, {
												size: 14,
												className: "text-accent"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] uppercase tracking-widest text-ink-soft",
												children: "Distance"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm font-semibold text-ink",
												children: [optimized.km, " km"]
											})] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											const site = allSites.find((s) => s.id === destSelect);
											if (site) openNavigation([site], travelMode);
										},
										className: "mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-ink/90",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { size: 14 }), "Start Navigation"]
									})]
								})
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-5 border-t border-ink/10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-display text-base text-ink",
								children: "My Heritage Tour"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-ink-soft",
								children: tourStops.length === 0 ? "Build a multi-stop heritage tour." : `${tourStops.length} stop${tourStops.length > 1 ? "s" : ""} · ${tourRoute.totalKm} km · ${tourRoute.duration}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-1.5",
								children: [tourStops.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "py-4 text-center text-xs text-ink-soft/60",
									children: "No stops added yet"
								}), tourStops.map((stop, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									layout: true,
									initial: {
										opacity: 0,
										x: -10
									},
									animate: {
										opacity: 1,
										x: 0
									},
									exit: {
										opacity: 0,
										x: -10
									},
									className: "flex items-center gap-2 rounded-xl border border-ink/10 bg-card px-3 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent",
											children: i + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs font-medium text-ink",
												children: stop.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-ink-soft",
												children: stop.municipality
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex shrink-0 gap-0.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => moveStop(i, -1),
													disabled: i === 0,
													className: "grid h-5 w-5 place-items-center rounded text-ink-soft hover:text-ink disabled:opacity-20",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { size: 12 })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => moveStop(i, 1),
													disabled: i === tourStops.length - 1,
													className: "grid h-5 w-5 place-items-center rounded text-ink-soft hover:text-ink disabled:opacity-20",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 12 })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => removeFromTour(stop.id),
													className: "grid h-5 w-5 place-items-center rounded text-ink-soft hover:text-red-500",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 11 })
												})
											]
										})
									]
								}, stop.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
										size: 14,
										className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Add a stop…",
										value: addToTourQuery,
										onChange: (e) => {
											setAddToTourQuery(e.target.value);
											setShowAddDropdown(true);
										},
										onFocus: () => setShowAddDropdown(true),
										className: "w-full rounded-xl border border-ink/10 bg-card py-2 pl-9 pr-3 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showAddDropdown && addableSites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									initial: {
										opacity: 0,
										y: -4
									},
									animate: {
										opacity: 1,
										y: 0
									},
									exit: {
										opacity: 0,
										y: -4
									},
									className: "absolute inset-x-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-ink/10 bg-cream shadow-lg",
									children: addableSites.slice(0, 6).map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => addToTour(site),
										className: "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-parchment/60 first:rounded-t-xl last:rounded-b-xl",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												size: 11,
												className: "shrink-0 text-accent"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate text-ink",
												children: site.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-auto text-[10px] text-ink-soft",
												children: site.municipality
											})
										]
									}, site.id))
								}) })]
							}),
							tourStops.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleOptimizeTour,
									className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-accent/90",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 12 }), "Optimize Route"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => openNavigation(tourStops, travelMode),
									className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-ink/90",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { size: 12 }), "Start Navigation"]
								})]
							}),
							tourStops.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setTourStops([]);
									setOptimized(null);
									setShowRouteResult(false);
								},
								className: "mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-ink/10 bg-card py-2 text-[11px] text-ink-soft transition-colors hover:text-ink",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 11 }), "Clear tour"]
							})
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showNearby && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							x: -20
						},
						animate: {
							opacity: 1,
							x: 0
						},
						exit: {
							opacity: 0,
							x: -20
						},
						transition: { duration: .3 },
						className: "w-72 rounded-2xl border border-ink/10 bg-cream/95 p-5 shadow-lg backdrop-blur-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-display text-base text-ink mb-3",
								children: "Recommended Nearby"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-ink-soft mb-4",
								children: "Heritage sites close to your location:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: allSites.slice(0, 5).map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/heritage/$id",
									params: { id: pin.id },
									className: "group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-parchment/50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-parchment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: pin.img,
											alt: pin.name,
											className: "h-full w-full object-cover",
											loading: "lazy"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-ink group-hover:text-accent truncate",
											children: pin.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-ink-soft",
											children: [
												pin.municipality,
												" · ",
												pin.category
											]
										})]
									})]
								}, pin.id))
							})
						]
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-full border border-ink/10 bg-cream/90 px-4 py-2 shadow backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft",
					children: [allSites.length, " heritage sites across 5 municipalities"]
				})
			})
		]
	});
}
//#endregion
export { MapPage as component };
