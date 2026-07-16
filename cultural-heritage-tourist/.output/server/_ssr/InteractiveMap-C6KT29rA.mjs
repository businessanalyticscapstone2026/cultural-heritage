import { a as __toESM } from "../_runtime.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion.mjs";
import { i as dest_4_default, n as dest_2_default, r as dest_3_default, t as dest_1_default } from "./dest-4-2R47JB-V.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
import { a as useMap, i as GeoJSON, n as Marker, o as useMapEvents, r as MapContainer, t as TileLayer } from "../_libs/react-leaflet.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as Clock, D as MapPin, G as ChevronDown, Q as Accessibility, c as Star, j as Landmark, l as SlidersHorizontal, s as Tag, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/InteractiveMap-C6KT29rA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
var provinces = [
	{
		id: "balayan",
		name: "Balayan",
		center: [13.9377, 120.732],
		zoom: 13,
		bounds: [[13.88, 120.65], [13.98, 120.82]]
	},
	{
		id: "calatagan",
		name: "Calatagan",
		center: [13.8322, 120.6328],
		zoom: 13,
		bounds: [[13.78, 120.58], [13.9, 120.72]]
	},
	{
		id: "lian",
		name: "Lian",
		center: [13.8619, 120.7178],
		zoom: 13,
		bounds: [[13.82, 120.65], [13.92, 120.78]]
	},
	{
		id: "nasugbu",
		name: "Nasugbu",
		center: [14.0689, 120.6308],
		zoom: 12,
		bounds: [[14, 120.55], [14.12, 120.72]]
	},
	{
		id: "tuy",
		name: "Tuy",
		center: [14.0167, 120.6833],
		zoom: 13,
		bounds: [[13.98, 120.62], [14.08, 120.78]]
	}
];
var philippinesCenter = [13.95, 120.68];
var mapPins = [
	{
		id: "basilica-martin",
		name: "Basilica of St. Martin de Tours",
		province: "Batangas",
		municipality: "Balayan",
		coords: [13.9372, 120.7315],
		image: dest_1_default,
		era: "1575",
		category: "Sacred",
		description: "One of the oldest churches in the Philippines, originally built by the Augustinians in 1575. The current structure dates from the 19th century and houses centuries-old religious artifacts.",
		accessibility: [
			"wheelchair",
			"guided-tours",
			"self-guided"
		],
		historicalSignificance: "national",
		nearbyAttractions: [
			"Balayan Town Plaza",
			"Galleria Taal",
			"Casa de Segunda"
		]
	},
	{
		id: "balayan-heritage-houses",
		name: "Balayan Heritage Houses",
		province: "Batangas",
		municipality: "Balayan",
		coords: [13.9385, 120.733],
		image: dest_2_default,
		era: "1800s",
		category: "Colonial",
		description: "A collection of well-preserved Spanish colonial-era ancestral houses along the town's heritage corridor, showcasing traditional bahay na bato architecture with capiz shell windows.",
		accessibility: ["self-guided", "guided-tours"],
		historicalSignificance: "regional",
		nearbyAttractions: ["Basilica of St. Martin de Tours", "Balayan Town Plaza"]
	},
	{
		id: "calatagan-ruins",
		name: "Calatagan Ruins",
		province: "Batangas",
		municipality: "Calatagan",
		coords: [13.831, 120.6335],
		image: dest_4_default,
		era: "1800s",
		category: "Colonial",
		description: "Ruins of a grand Spanish colonial estate overlooking Calatagan's coastline. The site features remnants of stone walls, a watchtower, and burial grounds dating to the pre-colonial period.",
		accessibility: ["self-guided", "hiking-required"],
		historicalSignificance: "regional",
		nearbyAttractions: [
			"Calatagan Beach",
			"Punta Fuego",
			"Liang Museum"
		]
	},
	{
		id: "calatagan-burial",
		name: "Calatagan Archaeological Site",
		province: "Batangas",
		municipality: "Calatagan",
		coords: [13.828, 120.629],
		image: dest_3_default,
		era: "14th century",
		category: "UNESCO",
		description: "A significant pre-colonial burial ground excavated in the 1960s, yielding thousands of artifacts including gold ornaments, ceramics, and stone tools from the 14th century.",
		accessibility: ["self-guided"],
		historicalSignificance: "world-heritage",
		nearbyAttractions: ["Calatagan Ruins", "Punta Fuego"]
	},
	{
		id: "lian-church",
		name: "Lian Church (San Juan Bautista)",
		province: "Batangas",
		municipality: "Lian",
		coords: [13.86, 120.715],
		image: dest_1_default,
		era: "1855",
		category: "Sacred",
		description: "A 19th-century coral stone church dedicated to St. John the Baptist, notable for its neoclassical facade and centuries-old baptistery. The church survived the Philippine Revolution.",
		accessibility: ["wheelchair", "guided-tours"],
		historicalSignificance: "regional",
		nearbyAttractions: ["Lian Town Plaza", "Malaruhatan Beach"]
	},
	{
		id: "nasugbu-church",
		name: "Our Lady of the Assumption Parish",
		province: "Batangas",
		municipality: "Nasugbu",
		coords: [14.0695, 120.629],
		image: dest_1_default,
		era: "1611",
		category: "Sacred",
		description: "Founded by the Augustinians in 1611, this historic church served as a fortress against Moro raids. Its thick stone walls and bell tower remain largely original.",
		accessibility: [
			"wheelchair",
			"guided-tours",
			"self-guided"
		],
		historicalSignificance: "national",
		nearbyAttractions: [
			"Fortune Island",
			"Nasugbu Beach",
			"Kay Gurang Cave"
		]
	},
	{
		id: "fortune-island",
		name: "Fortune Island Ruins",
		province: "Batangas",
		municipality: "Nasugbu",
		coords: [14.1167, 120.5833],
		image: dest_4_default,
		era: "1980s",
		category: "Colonial",
		description: "An abandoned luxury resort on a private island featuring a replica of the Acropolis of Athens. The dramatic ruins have become an iconic landmark and popular hiking destination.",
		accessibility: ["boat-access", "hiking-required"],
		historicalSignificance: "local",
		nearbyAttractions: ["Nasugbu Beach", "Montemaria Shrine"]
	},
	{
		id: "tuy-church",
		name: "San Jose Parish Church",
		province: "Batangas",
		municipality: "Tuy",
		coords: [14.017, 120.682],
		image: dest_1_default,
		era: "1875",
		category: "Sacred",
		description: "A sturdy Spanish colonial church built from volcanic stone, featuring a distinctive bell tower and an adjacent convento that now serves as the municipal hall.",
		accessibility: ["self-guided", "guided-tours"],
		historicalSignificance: "regional",
		nearbyAttractions: ["Tuy Town Plaza", "Gulod National Park"]
	},
	{
		id: "gulod-nature",
		name: "Gulod National Park",
		province: "Batangas",
		municipality: "Tuy",
		coords: [14.035, 120.71],
		image: dest_3_default,
		era: "Natural",
		category: "UNESCO",
		description: "A protected forest reserve at the foot of Mt. Malarayat, home to endemic flora and fauna. The park contains a pre-colonial trail network used by indigenous Tagalogs.",
		accessibility: ["hiking-required", "guided-tours"],
		historicalSignificance: "regional",
		nearbyAttractions: ["San Jose Parish Church", "Mt. Malarayat"]
	},
	{
		id: "malaruhatan-fort",
		name: "Malaruhatan Watchtower Ruins",
		province: "Batangas",
		municipality: "Lian",
		coords: [13.845, 120.69],
		image: dest_4_default,
		era: "1700s",
		category: "Colonial",
		description: "Remnants of a Spanish-era coastal defense watchtower used to warn against Moro pirate raids. The stone tower overlooks the Balayan Bay and is accessible via a short coastal trail.",
		accessibility: ["self-guided", "hiking-required"],
		historicalSignificance: "local",
		nearbyAttractions: ["Lian Church", "Malaruhatan Beach"]
	}
];
var provinceGeoJSON = {
	type: "FeatureCollection",
	features: [
		{
			type: "Feature",
			properties: {
				id: "nasugbu",
				name: "Nasugbu"
			},
			geometry: {
				type: "Polygon",
				coordinates: [[
					[120.55, 14.12],
					[120.58, 14.13],
					[120.64, 14.13],
					[120.7, 14.12],
					[120.72, 14.1],
					[120.73, 14.07],
					[120.72, 14.04],
					[120.7, 14.01],
					[120.66, 14],
					[120.6, 13.99],
					[120.56, 13.99],
					[120.54, 14.01],
					[120.53, 14.05],
					[120.54, 14.09],
					[120.55, 14.12]
				]]
			}
		},
		{
			type: "Feature",
			properties: {
				id: "tuy",
				name: "Tuy"
			},
			geometry: {
				type: "Polygon",
				coordinates: [[
					[120.62, 14.08],
					[120.66, 14.09],
					[120.7, 14.08],
					[120.74, 14.07],
					[120.77, 14.05],
					[120.78, 14.02],
					[120.77, 13.99],
					[120.74, 13.98],
					[120.7, 13.97],
					[120.66, 13.97],
					[120.62, 13.98],
					[120.6, 14],
					[120.59, 14.03],
					[120.6, 14.06],
					[120.62, 14.08]
				]]
			}
		},
		{
			type: "Feature",
			properties: {
				id: "balayan",
				name: "Balayan"
			},
			geometry: {
				type: "Polygon",
				coordinates: [[
					[120.65, 13.98],
					[120.69, 13.99],
					[120.73, 13.98],
					[120.78, 13.97],
					[120.82, 13.95],
					[120.83, 13.93],
					[120.82, 13.9],
					[120.8, 13.88],
					[120.76, 13.87],
					[120.72, 13.86],
					[120.68, 13.87],
					[120.65, 13.89],
					[120.63, 13.92],
					[120.62, 13.95],
					[120.63, 13.97],
					[120.65, 13.98]
				]]
			}
		},
		{
			type: "Feature",
			properties: {
				id: "lian",
				name: "Lian"
			},
			geometry: {
				type: "Polygon",
				coordinates: [[
					[120.65, 13.92],
					[120.68, 13.93],
					[120.72, 13.92],
					[120.76, 13.91],
					[120.78, 13.89],
					[120.78, 13.86],
					[120.77, 13.84],
					[120.74, 13.82],
					[120.7, 13.82],
					[120.66, 13.83],
					[120.63, 13.85],
					[120.62, 13.88],
					[120.63, 13.91],
					[120.65, 13.92]
				]]
			}
		},
		{
			type: "Feature",
			properties: {
				id: "calatagan",
				name: "Calatagan"
			},
			geometry: {
				type: "Polygon",
				coordinates: [[
					[120.58, 13.9],
					[120.62, 13.91],
					[120.66, 13.9],
					[120.7, 13.88],
					[120.72, 13.86],
					[120.72, 13.83],
					[120.7, 13.8],
					[120.67, 13.78],
					[120.63, 13.78],
					[120.6, 13.79],
					[120.57, 13.81],
					[120.55, 13.84],
					[120.54, 13.87],
					[120.56, 13.89],
					[120.58, 13.9]
				]]
			}
		}
	]
};
function MapPreviewPanel({ pin, isOpen, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isOpen && pin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			x: "100%",
			opacity: 0
		},
		animate: {
			x: 0,
			opacity: 1
		},
		exit: {
			x: "100%",
			opacity: 0
		},
		transition: {
			type: "spring",
			damping: 28,
			stiffness: 300
		},
		className: "absolute right-0 top-0 z-[1001] h-full w-full max-w-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-full overflow-hidden rounded-l-2xl border-l border-ink/10 bg-cream shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.35)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-cream/90 text-ink backdrop-blur-sm transition-all hover:bg-ink hover:text-cream",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						size: 16,
						strokeWidth: 2
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[4/3] w-full overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: pin.image,
							alt: pin.name,
							className: "h-full w-full object-cover",
							loading: "lazy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur",
							children: pin.category
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative px-5 pb-6 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-display text-2xl leading-tight text-ink",
							children: pin.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-xs text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
										size: 12,
										strokeWidth: 2
									}), pin.municipality]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-xs text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										size: 12,
										strokeWidth: 2
									}), pin.era]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-xs text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
										size: 12,
										strokeWidth: 2
									}), pin.category]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm leading-relaxed text-ink-soft",
							children: pin.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "flex-1 rounded-xl bg-ink px-4 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-accent",
								children: "View Route"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "flex-1 rounded-xl border border-ink/20 px-4 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent",
								children: "Bookmark"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl bg-parchment/60 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-widest text-ink-soft",
								children: "Coordinates"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs text-ink",
								children: [
									pin.coords[0].toFixed(4),
									"°N, ",
									pin.coords[1].toFixed(4),
									"°E"
								]
							})]
						})
					]
				})
			]
		})
	}) });
}
var accessibilityOptions = [
	{
		value: "wheelchair",
		label: "Wheelchair"
	},
	{
		value: "guided-tours",
		label: "Guided Tours"
	},
	{
		value: "self-guided",
		label: "Self-Guided"
	},
	{
		value: "hiking-required",
		label: "Hiking Required"
	},
	{
		value: "boat-access",
		label: "Boat Access"
	}
];
var significanceOptions = [
	{
		value: "world-heritage",
		label: "World Heritage"
	},
	{
		value: "national",
		label: "National"
	},
	{
		value: "regional",
		label: "Regional"
	},
	{
		value: "local",
		label: "Local"
	}
];
function FilterChip({ label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${active ? "border-accent bg-accent/15 text-ink shadow-sm" : "border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink"}`,
		children: label
	});
}
function FilterSection({ icon: Icon, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				size: 12,
				strokeWidth: 1.5,
				className: "text-ink-soft"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft",
				children: title
			})]
		}), children]
	});
}
function AdvancedFilters({ municipalities, attractionNames, filters, onFiltersChange, resultCount, totalCount }) {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const hasActiveFilters = filters.municipality !== "all" || filters.accessibility.length > 0 || filters.historicalSignificance.length > 0 || filters.nearbyAttractions !== "";
	const activeCount = (filters.municipality !== "all" ? 1 : 0) + filters.accessibility.length + filters.historicalSignificance.length + (filters.nearbyAttractions !== "" ? 1 : 0);
	const toggleAccessibility = (level) => {
		const next = filters.accessibility.includes(level) ? filters.accessibility.filter((a) => a !== level) : [...filters.accessibility, level];
		onFiltersChange({
			...filters,
			accessibility: next
		});
	};
	const toggleSignificance = (level) => {
		const next = filters.historicalSignificance.includes(level) ? filters.historicalSignificance.filter((s) => s !== level) : [...filters.historicalSignificance, level];
		onFiltersChange({
			...filters,
			historicalSignificance: next
		});
	};
	const clearAll = () => {
		onFiltersChange({
			municipality: "all",
			accessibility: [],
			historicalSignificance: [],
			nearbyAttractions: ""
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute right-4 top-4 z-[1000]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setIsOpen(!isOpen),
			className: `flex items-center gap-2 rounded-xl border px-3.5 py-2 backdrop-blur-md transition-all ${hasActiveFilters ? "border-accent/50 bg-cream/95 text-ink shadow-md" : "border-ink/10 bg-cream/95 text-ink-soft shadow-lg hover:border-ink/25 hover:text-ink"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
					size: 14,
					strokeWidth: 1.5
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-widest",
					children: "Filters"
				}),
				hasActiveFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] text-primary-foreground",
					children: activeCount
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
					size: 12,
					strokeWidth: 1.5,
					className: `transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: -8,
				scale: .96
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: -8,
				scale: .96
			},
			transition: {
				type: "spring",
				damping: 30,
				stiffness: 400
			},
			className: "absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-ink/10 bg-cream shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-ink/10 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft",
						children: "Advanced Filters"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [hasActiveFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: clearAll,
							className: "font-mono text-[10px] uppercase tracking-wider text-accent transition-colors hover:text-accent",
							children: "Clear all"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setIsOpen(false),
							className: "grid h-6 w-6 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								size: 12,
								strokeWidth: 2
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSection, {
							icon: MapPin,
							title: "Municipality",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
									label: "All",
									active: filters.municipality === "all",
									onClick: () => onFiltersChange({
										...filters,
										municipality: "all"
									})
								}), municipalities.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
									label: m,
									active: filters.municipality === m,
									onClick: () => onFiltersChange({
										...filters,
										municipality: filters.municipality === m ? "all" : m
									})
								}, m))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSection, {
							icon: Accessibility,
							title: "Accessibility",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: accessibilityOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
									label: opt.label,
									active: filters.accessibility.includes(opt.value),
									onClick: () => toggleAccessibility(opt.value)
								}, opt.value))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSection, {
							icon: Landmark,
							title: "Historical Significance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: significanceOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
									label: opt.label,
									active: filters.historicalSignificance.includes(opt.value),
									onClick: () => toggleSignificance(opt.value)
								}, opt.value))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterSection, {
							icon: Star,
							title: "Nearby Attraction",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: filters.nearbyAttractions,
									onChange: (e) => onFiltersChange({
										...filters,
										nearbyAttractions: e.target.value
									}),
									placeholder: "Search attractions...",
									className: "w-full rounded-lg border border-ink/10 bg-background px-3 py-2 font-mono text-xs text-ink placeholder:text-ink-soft/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
								}), filters.nearbyAttractions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onFiltersChange({
										...filters,
										nearbyAttractions: ""
									}),
									className: "absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-md text-ink-soft transition-colors hover:text-ink",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
										size: 10,
										strokeWidth: 2
									})
								})]
							}), filters.nearbyAttractions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 flex flex-wrap gap-1",
								children: attractionNames.filter((a) => a.toLowerCase().includes(filters.nearbyAttractions.toLowerCase())).slice(0, 5).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-md bg-parchment/60 px-2 py-0.5 font-mono text-[9px] text-ink-soft",
									children: a
								}, a))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-ink/10 px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[10px] uppercase tracking-widest text-ink-soft",
							children: [
								resultCount,
								" of ",
								totalCount,
								" sites"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-accent animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] text-ink-soft",
								children: "live"
							})]
						})]
					})
				})
			]
		}) })]
	});
}
function createPinIcon(loading) {
	return import_leaflet_src.default.divIcon({
		className: "",
		iconSize: [32, 42],
		iconAnchor: [16, 42],
		popupAnchor: [0, -44],
		html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;width:32px;height:42px;">
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:${loading ? "oklch(0.55 0.16 250)" : "oklch(0.55 0.16 250)"};
          border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:grid;place-items:center;
          position:relative;z-index:2;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
          </svg>
        </div>
        <div style="
          width:0;height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:10px solid oklch(0.55 0.16 250);
          margin-top:-4px;position:relative;z-index:1;
        "></div>
      </div>
    `
	});
}
function createActivePinIcon() {
	return import_leaflet_src.default.divIcon({
		className: "",
		iconSize: [40, 52],
		iconAnchor: [20, 52],
		popupAnchor: [0, -54],
		html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;width:40px;height:52px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:oklch(0.55 0.16 250);
          border:4px solid #fff;
          box-shadow:0 0 0 2px oklch(0.55 0.16 250), 0 4px 16px rgba(0,0,0,0.3);
          display:grid;place-items:center;
          position:relative;z-index:2;
          animation:pinPulse 1.5s ease-in-out infinite;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
          </svg>
        </div>
        <div style="
          width:0;height:0;
          border-left:10px solid transparent;
          border-right:10px solid transparent;
          border-top:12px solid oklch(0.55 0.16 250);
          margin-top:-6px;position:relative;z-index:1;
        "></div>
        <style>@keyframes pinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}</style>
      </div>
    `
	});
}
var defaultIcon = createPinIcon(false);
var activeIcon = createActivePinIcon();
function MapEvents({ onMapClick }) {
	useMapEvents({ click: () => onMapClick() });
	return null;
}
function ZoomController({ province }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		if (province) map.flyToBounds(province.bounds, {
			duration: 1.2,
			padding: [40, 40]
		});
		else map.flyTo(philippinesCenter, 11, { duration: 1.2 });
	}, [province, map]);
	return null;
}
function ProvinceLayer({ onProvinceClick, activeProvince }) {
	const map = useMap();
	const onEachFeature = (feature, layer) => {
		layer.on({
			click: () => {
				const prov = provinces.find((p) => p.id === feature.properties?.id);
				if (prov) onProvinceClick(prov);
			},
			mouseover: (e) => {
				e.target.setStyle({
					fillOpacity: .25,
					weight: 2.5
				});
				map.getContainer().style.cursor = "pointer";
			},
			mouseout: (e) => {
				e.target.setStyle({
					fillOpacity: feature.properties?.id === activeProvince ? .2 : .08,
					weight: feature.properties?.id === activeProvince ? 2.5 : 1.5
				});
				map.getContainer().style.cursor = "";
			}
		});
	};
	const style = (feature) => {
		const isActive = feature?.properties?.id === activeProvince;
		return {
			fillColor: isActive ? "oklch(0.55 0.16 250)" : "oklch(0.55 0.16 250)",
			fillOpacity: isActive ? .2 : .08,
			color: isActive ? "oklch(0.55 0.16 250)" : "oklch(0.55 0.16 250)",
			weight: isActive ? 2.5 : 1.5,
			opacity: isActive ? .8 : .5
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeoJSON, {
		data: provinceGeoJSON,
		style,
		onEachFeature
	}, activeProvince);
}
function InteractiveMap() {
	const [activePin, setActivePin] = (0, import_react.useState)(null);
	const [activeProvince, setActiveProvince] = (0, import_react.useState)(null);
	const [panelOpen, setPanelOpen] = (0, import_react.useState)(false);
	const [filters, setFilters] = (0, import_react.useState)({
		municipality: "all",
		accessibility: [],
		historicalSignificance: [],
		nearbyAttractions: ""
	});
	const mapRef = (0, import_react.useRef)(null);
	const municipalities = (0, import_react.useMemo)(() => [...new Set(mapPins.map((p) => p.municipality))].sort(), []);
	const attractionNames = (0, import_react.useMemo)(() => [...new Set(mapPins.flatMap((p) => p.nearbyAttractions))].sort(), []);
	const handlePinClick = (pin) => {
		setActivePin(pin);
		setPanelOpen(true);
	};
	const handleProvinceClick = (province) => {
		if (activeProvince?.id === province.id) setActiveProvince(null);
		else setActiveProvince(province);
		setActivePin(null);
		setPanelOpen(false);
	};
	const handleMapClick = () => {
		setActivePin(null);
		setPanelOpen(false);
	};
	const handleClosePanel = () => {
		setPanelOpen(false);
		setActivePin(null);
	};
	const handleResetView = () => {
		setActiveProvince(null);
		setActivePin(null);
		setPanelOpen(false);
	};
	const visiblePins = (0, import_react.useMemo)(() => {
		let pins = activeProvince ? mapPins.filter((p) => p.municipality === activeProvince.name) : mapPins;
		if (filters.municipality !== "all") pins = pins.filter((p) => p.municipality === filters.municipality);
		if (filters.accessibility.length > 0) pins = pins.filter((p) => filters.accessibility.every((a) => p.accessibility.includes(a)));
		if (filters.historicalSignificance.length > 0) pins = pins.filter((p) => filters.historicalSignificance.includes(p.historicalSignificance));
		if (filters.nearbyAttractions) {
			const query = filters.nearbyAttractions.toLowerCase();
			pins = pins.filter((p) => p.nearbyAttractions.some((a) => a.toLowerCase().includes(query)));
		}
		return pins;
	}, [activeProvince, filters]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-[500px] w-full overflow-hidden rounded-2xl border border-ink/10 shadow-[0_20px_60px_-20px_rgba(30,40,80,0.25)] md:h-[600px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        .leaflet-container {
          background: #f5f0e8 !important;
          font-family: var(--font-sans) !important;
        }
        .leaflet-control-zoom {
          border: 1px solid oklch(0.87 0.025 80) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
        }
        .leaflet-control-zoom a {
          background: oklch(0.984 0.012 85 / 0.95) !important;
          color: oklch(0.22 0.055 250) !important;
          border-color: oklch(0.87 0.025 80) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: oklch(0.966 0.02 82) !important;
        }
        .leaflet-control-zoom-in {
          border-bottom: 1px solid oklch(0.87 0.025 80) !important;
        }
        .leaflet-control-attribution {
          background: oklch(1 0 0 / 0.85) !important;
          color: oklch(0.45 0.03 250 / 0.6) !important;
          font-size: 10px !important;
          border-radius: 8px 0 0 0 !important;
          padding: 2px 8px !important;
        }
        .leaflet-control-attribution a {
          color: oklch(0.55 0.16 250) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          border: 1px solid oklch(0.87 0.025 80) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          min-width: 180px !important;
        }
        .leaflet-popup-tip {
          box-shadow: none !important;
        }
        .leaflet-interactive:focus {
          outline: none !important;
        }
      ` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
				center: philippinesCenter,
				zoom: 11,
				className: "h-full w-full",
				zoomControl: true,
				scrollWheelZoom: true,
				ref: mapRef,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
						attribution: "© <a href=\"https://carto.com/\">CARTO</a>",
						url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProvinceLayer, {
						onProvinceClick: handleProvinceClick,
						activeProvince: activeProvince?.id ?? null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomController, { province: activeProvince }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapEvents, { onMapClick: handleMapClick }),
					visiblePins.map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
						position: pin.coords,
						icon: activePin?.id === pin.id ? activeIcon : defaultIcon,
						eventHandlers: { click: (e) => {
							import_leaflet_src.default.DomEvent.stopPropagation(e.originalEvent);
							handlePinClick(pin);
						} }
					}, pin.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-3 top-3 z-[1000]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-xl border border-ink/10 bg-cream/95 shadow-lg backdrop-blur-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-ink/10 px-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft",
							children: "Municipalities"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleResetView,
							className: `rounded-lg px-3 py-1.5 text-xs transition-all ${!activeProvince ? "bg-ink text-primary-foreground" : "text-ink-soft hover:bg-ink/10"}`,
							children: "All"
						}), provinces.map((prov) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => handleProvinceClick(prov),
							className: `rounded-lg px-3 py-1.5 text-xs transition-all ${activeProvince?.id === prov.id ? "bg-ink text-primary-foreground" : "text-ink-soft hover:bg-ink/10"}`,
							children: prov.name
						}, prov.id))]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvancedFilters, {
				municipalities,
				attractionNames,
				filters,
				onFiltersChange: setFilters,
				resultCount: visiblePins.length,
				totalCount: mapPins.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-4 left-4 z-[1000]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 rounded-xl border border-ink/10 bg-cream/95 px-4 py-2.5 shadow-lg backdrop-blur-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-accent animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[10px] uppercase tracking-widest text-ink",
							children: [
								visiblePins.length,
								" ",
								visiblePins.length === 1 ? "site" : "sites"
							]
						})]
					}), activeProvince && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-px bg-ink/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-widest text-ink-soft",
						children: activeProvince.name
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPreviewPanel, {
				pin: activePin,
				isOpen: panelOpen,
				onClose: handleClosePanel
			})
		]
	});
}
//#endregion
export { InteractiveMap };
