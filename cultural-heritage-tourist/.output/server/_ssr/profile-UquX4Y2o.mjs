import { a as __toESM } from "../_runtime.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as Clock, O as LogOut, P as Heart, U as ChevronRight, Y as Bookmark, b as PenLine, c as Star, f as Settings, i as User, q as Camera } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./auth-D2gWtNPt.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Navbar } from "./Navbar-B_GQDJPv.mjs";
import { t as SiteFooter } from "./SiteFooter-CzE5SVhK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-UquX4Y2o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var interestLabels = {
	colonial: "Colonial Architecture",
	sacred: "Sacred Sites",
	nature: "Natural Heritage",
	art: "Art & Craft",
	music: "Living Culture",
	stories: "Stories & Lore",
	adventure: "Outdoor Trekking",
	coastal: "Coastal Heritage"
};
var savedDestinations = [
	{
		id: "basilica-martin",
		name: "Basilica of St. Martin de Tours",
		municipality: "Balayan",
		category: "Sacred",
		image: "/dest-1.jpg"
	},
	{
		id: "calatagan-archaeological",
		name: "Calatagan Archaeological Site",
		municipality: "Calatagan",
		category: "UNESCO",
		image: "/dest-4.jpg"
	},
	{
		id: "balayan-heritage-houses",
		name: "Balayan Heritage Houses",
		municipality: "Balayan",
		category: "Colonial",
		image: "/dest-2.jpg"
	},
	{
		id: "fortune-island",
		name: "Fortune Island Ruins",
		municipality: "Nasugbu",
		category: "Colonial",
		image: "/dest-3.jpg"
	}
];
var myReviews = [
	{
		site: "Basilica of St. Martin de Tours",
		siteId: "basilica-martin",
		rating: 5,
		text: "A breathtaking example of Baroque architecture. The centuries-old walls tell stories of the town deep spiritual roots.",
		date: "Jul 5, 2026"
	},
	{
		site: "Calatagan Archaeological Site",
		siteId: "calatagan-archaeological",
		rating: 4,
		text: "Fascinating pre-colonial burial ground. The gold ornaments on display are extraordinary.",
		date: "Jun 28, 2026"
	},
	{
		site: "Fortune Island Ruins",
		siteId: "fortune-island",
		rating: 4,
		text: "The Greek-style columns rising from the cliffside make for dramatic views. Best visited at sunset.",
		date: "Jun 20, 2026"
	}
];
var recentHistory = [
	{
		site: "Basilica of St. Martin de Tours",
		siteId: "basilica-martin",
		date: "Jul 10, 2026",
		action: "Visited"
	},
	{
		site: "Calatagan Archaeological Site",
		siteId: "calatagan-archaeological",
		date: "Jul 8, 2026",
		action: "Bookmarked"
	},
	{
		site: "Balayan Heritage Houses",
		siteId: "balayan-heritage-houses",
		date: "Jul 5, 2026",
		action: "Reviewed"
	},
	{
		site: "Fortune Island Ruins",
		siteId: "fortune-island",
		date: "Jul 1, 2026",
		action: "Viewed"
	},
	{
		site: "Lian Church",
		siteId: "lian-church",
		date: "Jun 28, 2026",
		action: "Viewed"
	}
];
function ProfilePage() {
	const { user, logout } = useAuth();
	const [tab, setTab] = (0, import_react.useState)("saved");
	const tabs = [
		{
			id: "saved",
			label: "Saved",
			icon: Bookmark
		},
		{
			id: "reviews",
			label: "Reviews",
			icon: Star
		},
		{
			id: "history",
			label: "History",
			icon: Clock
		},
		{
			id: "interests",
			label: "Interests",
			icon: Heart
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-cream pt-20 md:pt-24 border-b border-ink/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-w-7xl mx-auto px-6 md:px-10 py-12",
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
						className: "flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-24 w-24 rounded-full bg-parchment border-4 border-cream flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
										size: 36,
										strokeWidth: 1.5,
										className: "text-ink-soft"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-ink text-primary-foreground border-2 border-cream transition-colors hover:bg-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
										size: 14,
										strokeWidth: 1.5
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-4 text-display text-2xl",
								children: user?.name ?? "Guest"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-ink-soft",
								children: user?.email ?? ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "mt-4 flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink transition-colors hover:bg-parchment/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {
									size: 12,
									strokeWidth: 1.5
								}), "Edit Profile"]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "max-w-7xl mx-auto px-6 md:px-10 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .6,
						delay: .15
					},
					className: "grid grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-ink/10 bg-card p-6 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-display text-3xl",
								children: savedDestinations.length
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-ink-soft",
								children: "Saved"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-ink/10 bg-card p-6 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-display text-3xl",
								children: myReviews.length
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-ink-soft",
								children: "Reviews"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-ink/10 bg-card p-6 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-display text-3xl",
								children: recentHistory.length
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-ink-soft",
								children: "Visited"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "max-w-7xl mx-auto px-6 md:px-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-x-auto border-b border-ink/10",
					children: tabs.map((t) => {
						const Icon = t.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab(t.id),
							className: `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${tab === t.id ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 14 }), t.label]
						}, t.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-w-7xl mx-auto px-6 md:px-10 py-10 pb-24",
				children: [
					tab === "saved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .5 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-display text-xl mb-6",
							children: "Saved Destinations"
						}), savedDestinations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border-2 border-dashed border-ink/15 px-8 py-16 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "mx-auto h-12 w-12 text-ink/20 mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-ink-soft",
								children: "No saved destinations yet. Heart a site to save it here."
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
							children: savedDestinations.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/heritage/$id",
								params: { id: site.id },
								className: "group overflow-hidden rounded-2xl border border-ink/10 bg-card transition-shadow hover:shadow-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative aspect-[4/3] overflow-hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: site.image,
										alt: site.name,
										className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
										loading: "lazy"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute left-3 top-3 rounded-full bg-cream/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur",
										children: site.category
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium text-ink group-hover:text-accent transition-colors",
										children: site.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-ink-soft",
										children: site.municipality
									})]
								})]
							}, site.id))
						})]
					}),
					tab === "reviews" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .5 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-display text-xl mb-6",
							children: "My Reviews"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: myReviews.map((review, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-ink/10 bg-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/heritage/$id",
											params: { id: review.siteId },
											className: "text-display text-base text-ink hover:text-accent transition-colors",
											children: review.site
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-ink-soft shrink-0 ml-4",
											children: review.date
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex items-center gap-0.5",
										children: Array.from({ length: 5 }).map((_, s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											size: 12,
											className: s < review.rating ? "fill-accent text-accent" : "text-ink/20"
										}, s))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-ink-soft leading-relaxed",
										children: review.text
									})
								]
							}, i))
						})]
					}),
					tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .5 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-display text-xl mb-6",
							children: "Recent Activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: recentHistory.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/heritage/$id",
								params: { id: item.siteId },
								className: "group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-parchment/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										size: 16,
										className: "shrink-0 text-ink-soft"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-ink group-hover:text-accent transition-colors",
											children: item.site
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-ink-soft",
											children: [
												item.action,
												" · ",
												item.date
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
										size: 14,
										className: "shrink-0 text-ink-soft"
									})
								]
							}, i))
						})]
					}),
					tab === "interests" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .5 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-display text-xl",
								children: "Travel Interests"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/onboarding",
								className: "text-xs text-accent underline underline-offset-4 hover:text-ink transition-colors",
								children: "Update preferences"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-ink/10 bg-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium text-ink mb-3",
										children: "Interests"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [(user?.interests?.length ? user.interests : []).map((interest) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-parchment/60 border border-ink/10 px-3 py-1 text-xs text-ink",
											children: interestLabels[interest] ?? interest
										}, interest)), (!user?.interests || user.interests.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-ink-soft",
											children: "No interests set. Complete onboarding to personalize."
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-ink/10 bg-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium text-ink mb-3",
										children: "Travel Style"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-ink-soft",
										children: user?.travelStyle ? `You travel ${user.travelStyle}.` : "Not set yet."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-ink/10 bg-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium text-ink mb-3",
										children: "Accessibility"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: user?.accessibilityPrefs?.length ? user.accessibilityPrefs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-parchment/60 border border-ink/10 px-3 py-1 text-xs text-ink",
											children: p
										}, p)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-ink-soft",
											children: "No preferences set."
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-ink/10 bg-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium text-ink mb-3",
										children: "Travel Distance"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-ink-soft",
										children: user?.travelDistance ?? "Not set yet."
									})]
								})
							]
						})]
					}),
					tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .5 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-display text-xl mb-6",
							children: "Settings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 max-w-lg",
							children: [[
								{
									label: "Notification Preferences",
									desc: "Manage email and push notifications"
								},
								{
									label: "Privacy Settings",
									desc: "Control who can see your profile and activity"
								},
								{
									label: "Language",
									desc: "English"
								},
								{
									label: "Location Services",
									desc: user?.locationEnabled ? "Enabled" : "Disabled"
								}
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-2xl border border-ink/10 bg-card px-6 py-4 transition-colors hover:bg-parchment/30 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-ink",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-ink-soft mt-0.5",
									children: item.desc
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
									size: 14,
									className: "text-ink-soft"
								})]
							}, item.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: logout,
								className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-card px-6 py-4 text-sm text-red-600 transition-colors hover:bg-red-50 mt-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
									size: 16,
									strokeWidth: 1.5
								}), "Log Out"]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { ProfilePage as component };
