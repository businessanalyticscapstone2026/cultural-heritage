import { a as __toESM } from "../_runtime.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as Clock, D as MapPin, Y as Bookmark, c as Star, l as SlidersHorizontal, p as Search, t as X } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Navbar } from "./Navbar-B_GQDJPv.mjs";
import { t as SiteFooter } from "./SiteFooter-CzE5SVhK.mjs";
import { t as Route } from "./explore-DuDV08C_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-DaVSZzMp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var destinations = [
	{
		id: "basilica-martin",
		img: "/dest-1.jpg",
		name: "Basilica of St. Martin de Tours",
		municipality: "Balayan",
		category: "Sacred",
		era: "1575",
		rating: 4.8,
		description: "One of the oldest churches in the Philippines, featuring centuries of Baroque architecture."
	},
	{
		id: "calatagan-archaeological",
		img: "/dest-4.jpg",
		name: "Calatagan Archaeological Site",
		municipality: "Calatagan",
		category: "UNESCO",
		era: "14th century",
		rating: 4.9,
		description: "A significant pre-colonial burial ground yielding gold ornaments and ceramics."
	},
	{
		id: "balayan-heritage-houses",
		img: "/dest-2.jpg",
		name: "Balayan Heritage Houses",
		municipality: "Balayan",
		category: "Colonial",
		era: "1800s",
		rating: 4.5,
		description: "Well-preserved Spanish colonial ancestral houses with capiz shell windows."
	},
	{
		id: "fortune-island",
		img: "/dest-3.jpg",
		name: "Fortune Island Ruins",
		municipality: "Nasugbu",
		category: "Colonial",
		era: "1980s",
		rating: 4.3,
		description: "Dramatic ruins of an abandoned resort featuring Greek-style columns."
	},
	{
		id: "lian-church",
		img: "/dest-1.jpg",
		name: "Lian Church (San Juan Bautista)",
		municipality: "Lian",
		category: "Sacred",
		era: "1855",
		rating: 4.6,
		description: "A 19th-century coral stone church with a neoclassical facade."
	},
	{
		id: "nasugbu-church",
		img: "/dest-4.jpg",
		name: "Our Lady of the Assumption",
		municipality: "Nasugbu",
		category: "Sacred",
		era: "1611",
		rating: 4.7,
		description: "A historic church that served as fortress against Moro raids."
	},
	{
		id: "calatagan-ruins",
		img: "/dest-2.jpg",
		name: "Calatagan Ruins",
		municipality: "Calatagan",
		category: "Colonial",
		era: "1800s",
		rating: 4.4,
		description: "Ruins of a grand Spanish colonial estate overlooking the coastline."
	},
	{
		id: "gulod-park",
		img: "/dest-3.jpg",
		name: "Gulod National Park",
		municipality: "Tuy",
		category: "Natural",
		era: "Natural",
		rating: 4.2,
		description: "Protected forest reserve with endemic flora and pre-colonial trail networks."
	},
	{
		id: "tuy-church",
		img: "/dest-1.jpg",
		name: "San Jose Parish Church",
		municipality: "Tuy",
		category: "Sacred",
		era: "1875",
		rating: 4.5,
		description: "A sturdy Spanish colonial church built from volcanic stone."
	},
	{
		id: "malaruhatan-tower",
		img: "/dest-4.jpg",
		name: "Malaruhatan Watchtower",
		municipality: "Lian",
		category: "Colonial",
		era: "1700s",
		rating: 4.1,
		description: "Remnants of a Spanish-era coastal defense watchtower."
	}
];
var municipalities = [
	"All",
	"Balayan",
	"Calatagan",
	"Lian",
	"Nasugbu",
	"Tuy"
];
var categories = [
	"All",
	"Sacred",
	"Colonial",
	"UNESCO",
	"Natural"
];
function ExplorePage() {
	const { q } = Route.useSearch();
	const [search, setSearch] = (0, import_react.useState)(q);
	const [municipality, setMunicipality] = (0, import_react.useState)("All");
	const [category, setCategory] = (0, import_react.useState)("All");
	const [bookmarks, setBookmarks] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const activeFilterCount = (0, import_react.useMemo)(() => {
		let count = 0;
		if (search) count++;
		if (municipality !== "All") count++;
		if (category !== "All") count++;
		return count;
	}, [
		search,
		municipality,
		category
	]);
	const filtered = (0, import_react.useMemo)(() => {
		return destinations.filter((d) => {
			const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.municipality.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase());
			const matchesMunicipality = municipality === "All" || d.municipality === municipality;
			const matchesCategory = category === "All" || d.category === category;
			return matchesSearch && matchesMunicipality && matchesCategory;
		});
	}, [
		search,
		municipality,
		category
	]);
	const toggleBookmark = (id) => {
		setBookmarks((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-cream border-b border-ink/10 pt-20 md:pt-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-12 md:px-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Explore Heritage"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-display text-5xl leading-[1] md:text-6xl",
							children: "Browse all heritage sites"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-lg text-ink-soft",
							children: "Discover colonial churches, archaeological treasures, and natural heritage across Batangas 1st District."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 py-8 border-b border-ink/10 md:flex-row md:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 16,
									strokeWidth: 1.5,
									className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "Search sites…",
									value: search,
									onChange: (e) => setSearch(e.target.value),
									className: "w-full rounded-full border border-ink/10 bg-card py-2 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 transition-colors"
								}),
								search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setSearch(""),
									className: "absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 rounded-full border border-ink/10 bg-card px-3 py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
										size: 12,
										strokeWidth: 1.5,
										className: "text-ink-soft"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: municipality,
										onChange: (e) => setMunicipality(e.target.value),
										className: "appearance-none bg-transparent text-xs text-ink outline-none cursor-pointer pr-4",
										style: {
											backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%23666' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
											backgroundRepeat: "no-repeat",
											backgroundPosition: "right 4px center"
										},
										children: municipalities.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: m,
											children: m === "All" ? "All municipalities" : m
										}, m))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCategory(c),
										className: `rounded-full border px-4 py-1.5 text-xs transition ${category === c ? "border-accent bg-accent text-accent-foreground" : "border-ink/10 text-ink-soft hover:border-ink/25 hover:text-ink"}`,
										children: c
									}, c))
								}),
								activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										setSearch("");
										setMunicipality("All");
										setCategory("All");
									},
									className: "flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink-soft hover:text-ink transition",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 10 }),
										"Clear (",
										activeFilterCount,
										")"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between py-6 font-mono text-xs uppercase tracking-[0.25em] text-ink-soft",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							filtered.length,
							" of ",
							destinations.length,
							" sites"
						] })
					}),
					filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border-2 border-dashed border-ink/15 bg-parchment/30 px-8 py-20 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-ink-soft",
							children: "No sites match your filters. Try adjusting your search."
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
						children: filtered.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 24
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .5,
								delay: i * .05,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/heritage/$siteId",
								params: { siteId: d.id },
								className: "group flex flex-col rounded-2xl border border-ink/10 bg-card overflow-hidden transition-shadow hover:shadow-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative aspect-[4/3] overflow-hidden bg-parchment",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: d.img,
											alt: d.name,
											className: "h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105",
											loading: "lazy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur",
											children: d.category
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: (e) => {
												e.preventDefault();
												e.stopPropagation();
												toggleBookmark(d.id);
											},
											className: "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-cream/90 text-ink backdrop-blur transition-colors hover:text-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
												size: 14,
												strokeWidth: 1.5,
												className: bookmarks.has(d.id) ? "fill-current" : ""
											})
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-1 flex-col p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-display text-lg leading-tight text-ink",
											children: d.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center gap-3 text-xs text-ink-soft",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
													size: 12,
													strokeWidth: 1.5
												}), d.municipality]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
													size: 12,
													strokeWidth: 1.5
												}), d.era]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm text-ink-soft line-clamp-2",
											children: d.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-auto pt-3 flex items-center gap-1.5 text-xs text-ink-soft",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
												size: 12,
												strokeWidth: 1.5,
												className: "text-accent"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d.rating })]
										})
									]
								})]
							})
						}, d.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { ExplorePage as component };
