import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { E as Map, P as Heart, r as Users, z as Compass } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Navbar } from "./Navbar-B_GQDJPv.mjs";
import { t as SiteFooter } from "./SiteFooter-CzE5SVhK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-Db1TmAP1.js
var import_jsx_runtime = require_jsx_runtime();
var values = [
	{
		icon: Map,
		title: "Preserve Heritage",
		body: "We document and catalog cultural heritage sites across the Philippines to ensure they are remembered and protected for future generations."
	},
	{
		icon: Compass,
		title: "Empower Travelers",
		body: "Our interactive tools help tourists plan meaningful journeys through historically rich communities."
	},
	{
		icon: Heart,
		title: "Community-Driven",
		body: "Reviews, photos, and stories from local communities and travelers create a living archive of cultural memory."
	},
	{
		icon: Users,
		title: "Accessible Tourism",
		body: "We prioritize accessibility information so every traveler can experience the Philippines heritage, regardless of ability."
	}
];
var municipalities = [
	{
		name: "Balayan",
		desc: "One of the oldest towns in Batangas, home to the Basilica of St. Martin de Tours and a rich colonial heritage corridor."
	},
	{
		name: "Calatagan",
		desc: "Site of significant pre-colonial archaeological finds and a UNESCO World Heritage candidate."
	},
	{
		name: "Lian",
		desc: "A coastal town with a 19th-century coral stone church and Spanish-era watchtower ruins."
	},
	{
		name: "Nasugbu",
		desc: "Gateway to Fortune Island and home to the historic Our Lady of the Assumption Parish, founded in 1611."
	},
	{
		name: "Tuy",
		desc: "A highland municipality with volcanic stone churches and the protected Gulod National Park."
	}
];
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background text-foreground overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-cream border-b border-ink/10 pt-20 md:pt-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .7,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						className: "max-w-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " About Patrimonio"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-display text-5xl leading-[1] md:text-7xl",
								children: ["A living atlas of ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "italic text-accent",
									children: "Philippine heritage."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 max-w-xl text-lg text-ink-soft leading-relaxed",
								children: "Patrimonio is a cultural heritage tourism platform dedicated to documenting, preserving, and promoting the Philippines rich historical and cultural landmarks. We focus on Batangas 1st District — five municipalities of living history."
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					transition: { duration: .7 },
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Our Mission"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-display text-4xl leading-[1] md:text-5xl",
							children: ["Every stone has a ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
								className: "italic text-accent",
								children: "story."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 text-ink-soft leading-relaxed",
							children: "The Philippines is home to thousands of heritage sites — from centuries-old churches and colonial houses to archaeological treasures and natural wonders. Many of these sites lack digital documentation, making them invisible to modern travelers."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-ink-soft leading-relaxed",
							children: "Patrimonio bridges this gap by creating a comprehensive, community-driven atlas that makes heritage tourism accessible, personalized, and meaningful. Our GIS-powered platform helps travelers discover, plan, and experience heritage sites with context and care."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-ink/10 bg-parchment/40 grain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						transition: { duration: .7 },
						className: "mb-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " What We Stand For"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-display text-4xl leading-[1] md:text-5xl",
							children: ["Built on ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
								className: "italic text-accent",
								children: "values."
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4",
						children: values.map((v, i) => {
							const Icon = v.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
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
									duration: .6,
									delay: i * .08
								},
								className: "flex flex-col",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-4 grid h-12 w-12 place-items-center rounded-full border border-ink/15 bg-cream text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											size: 20,
											strokeWidth: 1.4
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-display text-xl text-ink",
										children: v.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-ink-soft",
										children: v.body
									})
								]
							}, v.title);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					transition: { duration: .7 },
					className: "mb-14",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-accent" }), " Our Focus Area"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-display text-4xl leading-[1] md:text-5xl",
							children: ["Batangas 1st ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
								className: "italic text-accent",
								children: "District."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-xl text-ink-soft",
							children: "Five municipalities. Centuries of history. A living heritage trail waiting to be explored."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
					children: municipalities.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
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
							duration: .6,
							delay: i * .08
						},
						className: "rounded-2xl border border-ink/10 bg-cream p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-display text-xl text-ink",
							children: m.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-ink-soft",
							children: m.desc
						})]
					}, m.name))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-ink/10 bg-parchment/40 grain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						transition: { duration: .7 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-display text-4xl leading-[1] md:text-5xl",
								children: ["Start your ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "italic text-accent",
									children: "journey."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-md mx-auto text-ink-soft",
								children: "Explore heritage sites across Batangas 1st District. Every visit supports local preservation efforts."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap items-center justify-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/explore",
									className: "rounded-full bg-ink px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
									children: "Explore Heritage Sites"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/map",
									className: "rounded-full border border-ink/25 px-8 py-3 text-sm text-ink transition-colors hover:border-ink",
									children: "View Interactive Map"
								})]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { AboutPage as component };
