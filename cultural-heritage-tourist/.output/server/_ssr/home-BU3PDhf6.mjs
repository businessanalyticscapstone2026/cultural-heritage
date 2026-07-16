import { a as __toESM } from "../_runtime.mjs";
import { n as useScroll, t as useTransform } from "../_libs/framer-motion.mjs";
import { i as dest_4_default, n as dest_2_default, r as dest_3_default, t as dest_1_default } from "./dest-4-2R47JB-V.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { J as Calendar, T as Megaphone, U as ChevronRight, V as Church, X as BookOpen, Z as ArrowRight, a as TreePine, c as Star, j as Landmark } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./auth-D2gWtNPt.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Navbar, t as AuthPrompt } from "./Navbar-B_GQDJPv.mjs";
import { t as SiteFooter } from "./SiteFooter-CzE5SVhK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-BU3PDhf6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var hero_heritage_default = "/assets/hero-heritage-DMbFUw3k.jpg";
var map_texture_default = "/assets/map-texture-CTix3ezk.jpg";
var fadeUp = {
	hidden: {
		opacity: 0,
		y: 32
	},
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: .9,
			ease: [
				.22,
				1,
				.36,
				1
			]
		}
	}
};
var featuredSites = [
	{
		img: dest_1_default,
		name: "Basilica of St. Martin de Tours",
		municipality: "Balayan",
		era: "1575",
		category: "Sacred",
		id: "basilica-martin",
		rating: 4.8
	},
	{
		img: dest_4_default,
		name: "Calatagan Archaeological Site",
		municipality: "Calatagan",
		era: "14th century",
		category: "UNESCO",
		id: "calatagan-archaeological",
		rating: 4.9
	},
	{
		img: dest_2_default,
		name: "Balayan Heritage Houses",
		municipality: "Balayan",
		era: "1800s",
		category: "Colonial",
		id: "balayan-heritage-houses",
		rating: 4.5
	},
	{
		img: dest_3_default,
		name: "Fortune Island Ruins",
		municipality: "Nasugbu",
		era: "1980s",
		category: "Colonial",
		id: "fortune-island",
		rating: 4.3
	}
];
var categories = [
	{
		icon: Church,
		label: "Churches",
		desc: "Discover Spanish-era architecture and sacred spaces.",
		count: 4,
		img: dest_1_default,
		color: "from-blue-600/80 to-blue-800/80"
	},
	{
		icon: Landmark,
		label: "Historical Landmarks",
		desc: "Walk through centuries of colonial history.",
		count: 3,
		img: dest_2_default,
		color: "from-amber-600/80 to-amber-800/80"
	},
	{
		icon: BookOpen,
		label: "Cultural Sites",
		desc: "Experience living traditions and local stories.",
		count: 2,
		img: dest_3_default,
		color: "from-rose-600/80 to-rose-800/80"
	},
	{
		icon: TreePine,
		label: "Natural Heritage",
		desc: "Explore protected forests and geological wonders.",
		count: 1,
		img: dest_4_default,
		color: "from-emerald-600/80 to-emerald-800/80"
	}
];
var popularSites = [
	{
		id: "basilica-martin",
		name: "Basilica of St. Martin de Tours",
		municipality: "Balayan",
		img: dest_1_default,
		visitors: "2.1k",
		rating: 4.8,
		category: "Sacred"
	},
	{
		id: "calatagan-archaeological",
		name: "Calatagan Archaeological Site",
		municipality: "Calatagan",
		img: dest_4_default,
		visitors: "1.8k",
		rating: 4.9,
		category: "UNESCO"
	},
	{
		id: "fortune-island",
		name: "Fortune Island Ruins",
		municipality: "Nasugbu",
		img: dest_3_default,
		visitors: "1.5k",
		rating: 4.3,
		category: "Colonial"
	}
];
var testimonials = [
	{
		name: "Maria Santos",
		role: "Heritage Advocate",
		rating: 5,
		text: "Patrimonio brought me back to my grandmother's stories. Walking through Balayan felt like stepping into a living museum."
	},
	{
		name: "Jose Reyes",
		role: "Travel Blogger",
		rating: 5,
		text: "The curated trails saved us hours of planning. The Calatagan archaeological sites were jaw-dropping."
	},
	{
		name: "Elena Cruz",
		role: "History Teacher",
		rating: 5,
		text: "I bring my students here every semester. The depth of information is unmatched — it makes history come alive."
	}
];
var InteractiveMap = (0, import_react.lazy)(() => import("./InteractiveMap-C6KT29rA.mjs").then((m) => ({ default: m.InteractiveMap })));
function HomePage() {
	const { user } = useAuth();
	const [authModal, setAuthModal] = (0, import_react.useState)({
		open: false,
		title: "",
		description: ""
	});
	const heroRef = (0, import_react.useRef)(null);
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ["start start", "end start"]
	});
	const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
	const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, .4]);
	const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
	const personalizedSites = featuredSites.slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background text-foreground overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPrompt, {
				open: authModal.open,
				onClose: () => setAuthModal({
					open: false,
					title: "",
					description: ""
				}),
				title: authModal.title,
				description: authModal.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				ref: heroRef,
				id: "top",
				className: "relative min-h-[100svh] w-full overflow-hidden pt-24 md:pt-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					style: {
						y: heroY,
						opacity: heroOpacity
					},
					className: "absolute inset-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: hero_heritage_default,
							alt: "Heritage town at golden hour",
							className: "h-[115%] w-full object-cover",
							width: 1920,
							height: 1280
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/40 to-cream" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-cream/60 via-transparent to-transparent" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					style: { y: heroTextY },
					className: "relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] max-w-7xl flex-col justify-center px-6 pb-40 md:px-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						animate: "show",
						variants: fadeUp,
						className: "max-w-4xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-ink/70",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-ink/60" }), "A Living Atlas · Est. Heritage Trails"]
							}),
							user && user.onboarded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-4 text-sm text-ink-soft",
								children: [
									"Welcome back, ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-ink",
										children: user.name.split(" ")[0]
									}),
									"!"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-ink",
								children: [
									"Walk through ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "history"
									}),
									",",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"one stone at a time."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-8 max-w-xl text-base text-ink-soft md:text-lg",
								children: "Discover cultural heritage destinations across Batangas 1st District. Curated routes, interactive maps, and stories carried by every facade, terrace, and shore."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-10 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/explore",
									className: "group rounded-full bg-ink px-8 py-3 text-sm text-primary-foreground transition hover:bg-accent",
									children: "Explore Heritage"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/map",
									className: "group rounded-full border border-ink/25 bg-cream/60 px-8 py-3 text-sm text-ink backdrop-blur-md transition hover:bg-ink hover:text-primary-foreground",
									children: "View Map"
								})]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-ink/10 bg-parchment/60 py-5 grain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-12 overflow-hidden whitespace-nowrap text-xs uppercase tracking-[0.35em] text-ink-soft",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeRow, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: "hidden",
					whileInView: "show",
					viewport: {
						once: true,
						margin: "-100px"
					},
					variants: fadeUp,
					className: "mb-14 flex items-end justify-between gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Featured Heritage Sites"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-display text-5xl leading-[1] md:text-7xl",
							children: [
								"Places that ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "italic text-accent",
									children: "hold"
								}),
								" a story."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-md text-ink-soft",
							children: "Hand-picked destinations that showcase the rich cultural tapestry of Batangas."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/explore",
						className: "group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex",
						children: ["View all sites ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							size: 14,
							className: "transition-transform group-hover:translate-x-1"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-6 md:grid-cols-4",
					children: featuredSites.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 40
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: {
							once: true,
							margin: "-60px"
						},
						transition: {
							duration: .8,
							delay: i * .08,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/heritage/$id",
							params: { id: d.id },
							className: "group relative flex flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative aspect-[3/4] overflow-hidden rounded-2xl bg-parchment",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: d.img,
										alt: d.name,
										className: "h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110",
										loading: "lazy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute left-3 top-3 rounded-full bg-cream/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur",
										children: d.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-1 text-xs font-medium text-ink opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 backdrop-blur",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											size: 10,
											className: "fill-amber-400 text-amber-400"
										}), d.rating]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-display text-xl leading-tight text-ink transition-colors group-hover:text-accent",
									children: d.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-ink-soft",
									children: d.municipality
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-accent",
									children: d.era
								})]
							})]
						})
					}, d.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-ink/10 bg-parchment/40 grain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "show",
						viewport: {
							once: true,
							margin: "-100px"
						},
						variants: fadeUp,
						className: "mb-14",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Tourism Highlights"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-display text-5xl leading-[1] md:text-7xl",
								children: [
									"What's ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "happening"
									}),
									" in the district."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-md text-ink-soft",
								children: "Festivals, heritage walks, and cultural events happening across the five municipalities."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 30
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: { duration: .7 },
								className: "group relative row-span-2 min-h-[420px] overflow-hidden rounded-3xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: dest_1_default,
										alt: "Parada ng Lechon",
										className: "absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105",
										loading: "lazy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex h-full flex-col justify-end p-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 10 }), " Festival"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-display text-3xl text-cream md:text-4xl",
												children: "Parada ng Lechon"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 max-w-sm text-sm text-cream/80",
												children: "Experience Batangas' biggest food festival — a vibrant celebration of community, culture, and cuisine."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 flex items-center gap-4 text-xs text-cream/70",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "June 24, 2026" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full bg-cream/40" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Balayan" })
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-6",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-1.5 text-sm font-medium text-cream transition-colors group-hover:text-accent",
													children: ["Learn more ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
														size: 14,
														className: "transition-transform group-hover:translate-x-1"
													})]
												})
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 30
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: {
									duration: .7,
									delay: .1
								},
								className: "group relative overflow-hidden rounded-3xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: dest_2_default,
										alt: "Heritage Walk",
										className: "absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105",
										loading: "lazy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-ink/70 to-ink/30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex flex-col justify-end p-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { size: 10 }), " Event"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-display text-2xl text-cream",
												children: "Heritage Walk: Balayan"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-cream/80",
												children: "Every Saturday · Balayan Town Plaza"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 30
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: {
									duration: .7,
									delay: .2
								},
								className: "group relative overflow-hidden rounded-3xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: dest_4_default,
										alt: "New Heritage Markers",
										className: "absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105",
										loading: "lazy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-ink/70 to-ink/30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex flex-col justify-end p-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { size: 10 }), " Announcement"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-display text-2xl text-cream",
												children: "New Heritage Markers Unveiled"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-cream/80",
												children: "July 15, 2026 · Calatagan"
											})
										]
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: "hidden",
					whileInView: "show",
					viewport: {
						once: true,
						margin: "-100px"
					},
					variants: fadeUp,
					className: "mb-14",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Categories"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-display text-5xl leading-[1] md:text-7xl",
							children: ["Explore by ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
								className: "italic text-accent",
								children: "type."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-lg text-ink-soft",
							children: "Find the heritage experience that matches your interests — from sacred spaces to wild landscapes."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0 snap-x snap-mandatory",
					children: categories.map((c, i) => {
						const Icon = c.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: { once: true },
							transition: {
								duration: .5,
								delay: i * .08
							},
							className: "min-w-[260px] snap-start md:min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/explore",
								className: "group relative flex h-[320px] flex-col justify-end overflow-hidden rounded-3xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: c.img,
										alt: c.label,
										className: "absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110",
										loading: "lazy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-0 bg-gradient-to-t ${c.color}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-ink/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative p-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mb-3 grid h-10 w-10 place-items-center rounded-full bg-cream/20 text-cream backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
													size: 18,
													strokeWidth: 1.4
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-display text-xl text-cream",
												children: c.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-cream/80",
												children: c.desc
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 flex items-center gap-1 text-xs text-cream/70 transition-colors group-hover:text-cream",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [c.count, " destinations"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
													size: 12,
													className: "transition-transform group-hover:translate-x-1"
												})]
											})
										]
									})
								]
							})
						}, c.label);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-ink/10 bg-parchment/40 grain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "show",
						viewport: {
							once: true,
							margin: "-100px"
						},
						variants: fadeUp,
						className: "mb-14 flex items-end justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Popular This Week"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-display text-5xl leading-[1] md:text-7xl",
								children: ["Trending ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "italic text-accent",
									children: "destinations."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-md text-ink-soft",
								children: "The sites travelers are exploring most right now."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/explore",
							className: "group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex",
							children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "transition-transform group-hover:translate-x-1"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-4 md:grid-cols-3",
						children: popularSites.map((site, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 30
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: { once: true },
							transition: {
								duration: .6,
								delay: i * .1
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/heritage/$id",
								params: { id: site.id },
								className: "group flex items-center gap-5 rounded-2xl border border-ink/10 bg-card p-4 transition-all hover:shadow-lg hover:border-ink/20",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-parchment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: site.img,
											alt: site.name,
											className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
											loading: "lazy"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-[10px] uppercase tracking-widest text-accent",
													children: site.category
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "mt-1 truncate text-sm font-medium text-ink group-hover:text-accent transition-colors",
												children: site.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-xs text-ink-soft",
												children: site.municipality
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 flex items-center gap-3 text-xs text-ink-soft",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
															size: 10,
															className: "fill-amber-400 text-amber-400"
														}), site.rating]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full bg-ink/20" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [site.visitors, " visitors this week"] })
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
										size: 16,
										className: "shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent"
									})
								]
							})
						}, site.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "map",
				className: "relative overflow-hidden bg-ink text-primary-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 opacity-30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: map_texture_default,
						alt: "",
						className: "h-full w-full object-cover",
						loading: "lazy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: "hidden",
							whileInView: "show",
							viewport: { once: true },
							variants: fadeUp,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-cream/60" }), " Interactive GIS Atlas"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-display text-5xl leading-[1] md:text-7xl",
									children: [
										"A map that ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
											className: "italic text-cream/80",
											children: "remembers"
										}),
										" every road taken."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-6 max-w-sm text-cream/70",
									children: "Heritage sites across Batangas 1st District — tap a pin to preview stories, routes, and details."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-12 grid grid-cols-3 gap-6 border-t border-cream/15 pt-8",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											n: "10",
											label: "Heritage sites"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											n: "5",
											label: "Municipalities"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											n: "6",
											label: "Curated routes"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/map",
									className: "group mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm text-ink transition hover:bg-accent hover:text-primary-foreground",
									children: ["Open Full Map ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										size: 14,
										className: "transition-transform group-hover:translate-x-1"
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								x: 40
							},
							whileInView: {
								opacity: 1,
								x: 0
							},
							viewport: {
								once: true,
								margin: "-80px"
							},
							transition: {
								duration: 1.1,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-[500px] w-full items-center justify-center rounded-2xl border border-cream/10 bg-cream/5 backdrop-blur md:h-[600px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-center gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-cream/20 border-t-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs uppercase tracking-widest text-cream/50",
											children: "Loading map..."
										})]
									})
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InteractiveMap, {})
							})
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: "hidden",
					whileInView: "show",
					viewport: {
						once: true,
						margin: "-100px"
					},
					variants: fadeUp,
					className: "mb-14 flex items-end justify-between gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }),
									" ",
									user?.onboarded ? "Recommended For You" : "Recommended Sites"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-display text-5xl leading-[1] md:text-7xl",
								children: user?.onboarded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Destinations that ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "fit"
									}),
									" you."
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Explore ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "popular"
									}),
									" destinations."
								] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-md text-ink-soft",
								children: user?.onboarded ? "Curated picks based on your interests, travel style, and accessibility needs." : "The most loved heritage sites across the five municipalities."
							})
						] }),
						!user?.onboarded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setAuthModal({
								open: true,
								title: "Sign in for personalized picks",
								description: "Create a free account to get heritage recommendations tailored to your interests, travel style, and accessibility needs."
							}),
							className: "hidden text-sm text-ink-soft underline underline-offset-4 hover:text-ink md:inline",
							children: "Get personalized picks →"
						}),
						user?.onboarded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/explore",
							className: "group hidden items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink md:inline-flex",
							children: ["Get personalized picks ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "transition-transform group-hover:translate-x-1"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
					children: personalizedSites.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 30
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						transition: {
							duration: .7,
							delay: i * .1
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/heritage/$id",
							params: { id: d.id },
							className: "group flex flex-col rounded-2xl border border-ink/10 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-ink/20 hover:-translate-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative aspect-[4/3] overflow-hidden",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: d.img,
										alt: d.name,
										className: "h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110",
										loading: "lazy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur",
										children: d.category
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-display text-lg leading-tight text-ink group-hover:text-accent transition-colors",
										children: d.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-ink-soft",
										children: d.municipality
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
												size: 12,
												className: "fill-amber-400 text-amber-400"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-ink-soft",
												children: [
													d.rating,
													" · ",
													d.era
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											size: 14,
											className: "text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent"
										})]
									})
								]
							})]
						})
					}, d.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-ink/10 bg-parchment/50 grain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "show",
						viewport: {
							once: true,
							margin: "-100px"
						},
						variants: fadeUp,
						className: "mb-14 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Testimonials"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-display text-5xl leading-[1] md:text-7xl",
								children: [
									"Travelers ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic text-accent",
										children: "love"
									}),
									" this."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 mx-auto max-w-md text-ink-soft",
								children: "Stories from the road — real experiences from heritage explorers."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-6 md:grid-cols-3",
						children: testimonials.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 30
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: { once: true },
							transition: {
								duration: .7,
								delay: i * .1
							},
							className: "rounded-2xl border border-ink/10 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-ink/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1 mb-3",
									children: Array.from({ length: 5 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
										size: 14,
										className: j < t.rating ? "fill-amber-400 text-amber-400" : "text-ink/20"
									}, j))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm leading-relaxed text-ink-soft",
									children: [
										"\"",
										t.text,
										"\""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center gap-3 border-t border-ink/10 pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-10 rounded-full bg-parchment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-ink",
										children: t.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-ink-soft",
										children: t.role
									})] })]
								})
							]
						}, t.name))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 40
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					transition: { duration: 1 },
					className: "relative overflow-hidden rounded-3xl bg-ink px-8 py-20 text-center text-primary-foreground md:px-16 md:py-32",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 opacity-20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: map_texture_default,
							alt: "",
							className: "h-full w-full object-cover",
							loading: "lazy"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto mb-6 flex w-fit items-center gap-3 text-xs uppercase tracking-[0.3em] text-cream/70",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-cream/60" }), " Start Your Journey"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mx-auto max-w-3xl text-display text-5xl leading-[1] md:text-7xl",
								children: [
									"Carry the ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
										className: "italic",
										children: "archive"
									}),
									" in your pocket."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-6 max-w-lg text-cream/70",
								children: user?.onboarded ? "Your personalized journey continues. Explore nearby heritage sites, save your favorites, and share your discoveries." : "Join thousands of travelers exploring the Philippines' cultural heritage with curated routes, smart recommendations, and interactive maps."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-10 flex flex-wrap items-center justify-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/explore",
										className: "group rounded-full bg-cream px-8 py-3 text-sm font-medium text-ink transition hover:bg-accent hover:text-primary-foreground",
										children: "Start Exploring"
									}),
									!user?.onboarded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/signup",
										className: "rounded-full border border-cream/30 px-8 py-3 text-sm text-cream/90 transition hover:border-cream",
										children: "Create free account"
									}),
									user?.onboarded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/map",
										className: "group rounded-full border border-cream/30 px-8 py-3 text-sm text-cream/90 transition hover:border-cream",
										children: ["Open GIS Map ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											size: 14,
											className: "ml-1 inline transition-transform group-hover:translate-x-1"
										})]
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Stat({ n, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-display text-4xl text-cream md:text-5xl",
		children: n
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 text-xs uppercase tracking-widest text-cream/60",
		children: label
	})] });
}
function MarqueeRow() {
	const items = [
		"Balayan · 1575",
		"Calatagan · UNESCO",
		"Nasugbu · 1611",
		"Lian · 1855",
		"Tuy · 1875",
		"Batangas Heritage Trail",
		"District 1 · Living Culture"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex animate-[marquee_40s_linear_infinite] gap-12 [--tw:_]",
		children: [[...items, ...items].map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-12",
			children: [t, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full bg-accent" })]
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }` })]
	});
}
//#endregion
export { HomePage as component };
