import { a as __toESM } from "../_runtime.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as Clock, D as MapPin, I as Globe, R as ExternalLink, S as Navigation, W as ChevronLeft, Y as Bookmark, c as Star, d as Share2, s as Tag, y as Phone } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Navbar } from "./Navbar-B_GQDJPv.mjs";
import { t as SiteFooter } from "./SiteFooter-CzE5SVhK.mjs";
import { t as Route } from "./heritage._id-BJxJwwLU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/heritage._id-BEEuwrIK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var heritageSites = {
	"basilica-martin": {
		id: "basilica-martin",
		name: "Basilica of St. Martin de Tours",
		municipality: "Balayan",
		category: "Sacred",
		era: "1575",
		rating: 4.8,
		reviewCount: 124,
		description: "One of the oldest churches in the Philippines.",
		longDescription: "Originally built by the Augustinians in 1575, the Basilica of St. Martin de Tours stands as one of the oldest stone churches in the Philippines. The current structure, rebuilt in the 19th century, houses centuries-old religious artifacts including a silver tabernacle and ivory santos. The church survived the Philippine Revolution and both World Wars, serving as a silent witness to Batangas' rich colonial history. Its massive stone walls and baroque interior decorations make it a must-visit for heritage enthusiasts.",
		images: [
			"/dest-1.jpg",
			"/dest-2.jpg",
			"/dest-3.jpg"
		],
		accessibility: [
			"Wheelchair accessible",
			"Guided tours available",
			"Self-guided visits"
		],
		facilities: [
			"Restrooms",
			"Gift shop",
			"Parking",
			"Tourist information"
		],
		operatingHours: "Mon-Sun: 6:00 AM - 6:00 PM",
		contact: "+63 43 123 4567",
		website: "https://example.com",
		coordinates: [13.9372, 120.7315],
		nearbyAttractions: [
			{
				id: "balayan-heritage-houses",
				name: "Balayan Heritage Houses",
				distance: "0.3 km",
				category: "Colonial"
			},
			{
				id: "calatagan-archaeological",
				name: "Calatagan Archaeological Site",
				distance: "12.5 km",
				category: "UNESCO"
			},
			{
				id: "calatagan-ruins",
				name: "Calatagan Ruins",
				distance: "13.2 km",
				category: "Colonial"
			}
		],
		reviews: [
			{
				author: "Maria S.",
				date: "2025-12-15",
				rating: 5,
				text: "Absolutely stunning church with incredible history. The guided tour was very informative."
			},
			{
				author: "Juan D.",
				date: "2025-11-20",
				rating: 4,
				text: "Beautiful architecture and peaceful atmosphere. The baroque details are remarkable."
			},
			{
				author: "Ana R.",
				date: "2025-10-05",
				rating: 5,
				text: "A must-visit when in Batangas. The church has been lovingly preserved."
			}
		]
	},
	"calatagan-archaeological": {
		id: "calatagan-archaeological",
		name: "Calatagan Archaeological Site",
		municipality: "Calatagan",
		category: "UNESCO",
		era: "1300",
		rating: 4.6,
		reviewCount: 87,
		description: "UNESCO-listed archaeological site with pre-colonial artifacts.",
		longDescription: "The Calatagan Archaeological Site is a UNESCO World Heritage candidate that showcases a wealth of pre-colonial artifacts dating back to the 14th century. Excavations have uncovered burial jars, trade ceramics, gold ornaments, and other cultural objects that reveal the sophisticated society that existed before Spanish colonization. The site provides invaluable insights into the early trade networks connecting the Philippines to China, Japan, and Southeast Asia.",
		images: [
			"/dest-2.jpg",
			"/dest-1.jpg",
			"/dest-4.jpg"
		],
		accessibility: ["Wheelchair accessible", "Guided tours available"],
		facilities: [
			"Restrooms",
			"Museum",
			"Parking"
		],
		operatingHours: "Tue-Sun: 8:00 AM - 5:00 PM",
		contact: "+63 43 722 0000",
		website: "https://example.com",
		coordinates: [13.8856, 120.7401],
		nearbyAttractions: [{
			id: "calatagan-ruins",
			name: "Calatagan Ruins",
			distance: "0.8 km",
			category: "Colonial"
		}, {
			id: "basilica-martin",
			name: "Basilica of St. Martin de Tours",
			distance: "12.5 km",
			category: "Sacred"
		}],
		reviews: [{
			author: "Dr. Reyes",
			date: "2025-09-10",
			rating: 5,
			text: "A treasure trove of Philippine history. The artifacts are world-class."
		}, {
			author: "Elena T.",
			date: "2025-08-22",
			rating: 4,
			text: "Very educational. The guides are knowledgeable and passionate about the site."
		}]
	}
};
var fallbackSite = {
	id: "unknown",
	name: "Heritage Site",
	municipality: "Batangas",
	category: "Colonial",
	era: "1900",
	rating: 4,
	reviewCount: 0,
	description: "A heritage site in Batangas Province.",
	longDescription: "This is a heritage site in Batangas Province, Philippines. Detailed information about this site is currently being compiled by our heritage team. Please check back later for a full description, history, and visitor information.",
	images: ["/dest-1.jpg", "/dest-2.jpg"],
	accessibility: ["Self-guided visits"],
	facilities: ["Parking"],
	operatingHours: "Mon-Sun: 8:00 AM - 5:00 PM",
	contact: "",
	website: "",
	coordinates: [13.9, 120.7],
	nearbyAttractions: [],
	reviews: []
};
function HeritageDetailsPage() {
	const { id } = Route.useParams();
	const site = heritageSites[id] ?? {
		...fallbackSite,
		id
	};
	const [activeImage, setActiveImage] = (0, import_react.useState)(0);
	const [reviewText, setReviewText] = (0, import_react.useState)("");
	const [bookmarked, setBookmarked] = (0, import_react.useState)(false);
	const [reviewRating, setReviewRating] = (0, import_react.useState)(5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-cream pt-20 md:pt-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-6 py-4 md:px-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/explore",
						className: "inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), "Back to Explore"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-cream",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-6 md:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .6,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						className: "relative aspect-[16/9] overflow-hidden rounded-2xl bg-parchment",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: site.images[activeImage] ?? site.images[0],
							alt: site.name,
							className: "h-full w-full object-cover",
							width: 1920,
							height: 1080
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute left-4 top-4 rounded-full bg-cream/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur",
							children: site.category
						})]
					}), site.images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-3",
						children: site.images.map((img, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveImage(i),
							className: `relative aspect-video w-1/3 overflow-hidden rounded-xl bg-parchment transition-all ${i === activeImage ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: img,
								alt: `${site.name} photo ${i + 1}`,
								className: "h-full w-full object-cover",
								loading: "lazy"
							})
						}, i))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-7xl px-6 pb-24 md:px-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_350px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .6,
								delay: .1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-display text-4xl text-ink md:text-5xl",
									children: site.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), site.municipality]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
												"Est. ",
												site.era
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" }), site.category]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-0.5",
										children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-4 w-4 ${i < Math.round(site.rating) ? "fill-accent text-accent" : "fill-ink/10 text-ink/10"}` }, i))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm text-ink-soft",
										children: [
											site.rating,
											" (",
											site.reviewCount,
											" reviews)"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setBookmarked(!bookmarked),
										className: `inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${bookmarked ? "border-accent/40 bg-accent/10 text-accent" : "border-ink/15 bg-transparent text-ink-soft hover:text-ink"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: `h-4 w-4 ${bookmarked ? "fill-accent" : ""}` }), bookmarked ? "Bookmarked" : "Bookmark"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-transparent px-4 py-2.5 text-sm text-ink-soft transition hover:text-ink",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }), "Share"]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-10 h-px bg-ink/10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .6,
								delay: .2
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-display text-2xl text-ink",
								children: "About this site"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 leading-relaxed text-ink-soft",
								children: site.longDescription
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-10 h-px bg-ink/10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .6,
								delay: .3
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-display text-2xl text-ink",
								children: "Accessibility"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: site.accessibility.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-ink/15 bg-parchment/50 px-3 py-1 text-xs text-ink-soft",
									children: item
								}, item))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-10 h-px bg-ink/10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .6,
								delay: .35
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-display text-2xl text-ink",
								children: "Facilities"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: site.facilities.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-ink/15 bg-parchment/50 px-3 py-1 text-xs text-ink-soft",
									children: item
								}, item))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-10 h-px bg-ink/10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .6,
								delay: .4
							},
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 text-sm text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 shrink-0" }), site.operatingHours]
								}),
								site.contact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 text-sm text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 shrink-0" }), site.contact]
								}),
								site.website && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: site.website,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "flex items-center gap-3 text-sm text-accent transition-colors hover:text-ink",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 shrink-0" }),
										"Visit website",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-10 h-px bg-ink/10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 20
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .6,
								delay: .45
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-display text-2xl text-ink",
									children: "Reviews"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 space-y-4",
									children: site.reviews.map((review, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl border border-ink/10 bg-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-medium text-ink",
												children: review.author
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-3 text-xs text-ink-soft",
												children: new Date(review.date).toLocaleDateString("en-US", {
													year: "numeric",
													month: "short",
													day: "numeric"
												})
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-0.5",
												children: Array.from({ length: 5 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-3 w-3 ${j < review.rating ? "fill-accent text-accent" : "fill-ink/10 text-ink/10"}` }, j))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-relaxed text-ink-soft",
											children: review.text
										})]
									}, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 rounded-2xl border border-ink/10 bg-card p-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-display text-lg text-ink",
											children: "Leave a Review"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 flex items-center gap-1",
											children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setReviewRating(i + 1),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-5 w-5 transition ${i < reviewRating ? "fill-accent text-accent" : "fill-ink/10 text-ink/10"}` })
											}, i))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: reviewText,
											onChange: (e) => setReviewText(e.target.value),
											placeholder: "Share your experience...",
											rows: 4,
											className: "mt-4 w-full rounded-xl border border-ink/15 bg-cream/50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-accent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "mt-4 rounded-xl bg-ink px-6 py-2.5 text-sm text-primary-foreground transition hover:bg-accent",
											children: "Submit Review"
										})
									]
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6 lg:sticky lg:top-28 lg:self-start",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									x: 20
								},
								animate: {
									opacity: 1,
									x: 0
								},
								transition: {
									duration: .6,
									delay: .2
								},
								className: "rounded-2xl border border-ink/10 bg-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-display text-lg text-ink",
										children: "Location"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 font-mono text-xs text-ink-soft",
										children: [
											site.coordinates[0],
											", ",
											site.coordinates[1]
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `https://www.google.com/maps/dir/?api=1&destination=${site.coordinates[0]},${site.coordinates[1]}`,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-primary-foreground transition hover:bg-accent",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "h-4 w-4" }), "Start Navigation"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `https://www.google.com/maps?q=${site.coordinates[0]},${site.coordinates[1]}`,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink-soft transition hover:text-ink",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), "View on Map"]
										})]
									})
								]
							}),
							site.nearbyAttractions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									x: 20
								},
								animate: {
									opacity: 1,
									x: 0
								},
								transition: {
									duration: .6,
									delay: .3
								},
								className: "rounded-2xl border border-ink/10 bg-card p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-display text-lg text-ink",
									children: "Nearby Attractions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 space-y-3",
									children: site.nearbyAttractions.map((attraction) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/heritage/$id",
										params: { id: attraction.id },
										className: "group flex items-start justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-parchment/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium text-ink group-hover:text-accent",
											children: attraction.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block text-xs text-ink-soft",
											children: [
												attraction.distance,
												" · ",
												attraction.category
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mt-0.5 h-4 w-4 rotate-180 text-ink-soft group-hover:text-accent" })]
									}, attraction.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									x: 20
								},
								animate: {
									opacity: 1,
									x: 0
								},
								transition: {
									duration: .6,
									delay: .4
								},
								className: "rounded-2xl border border-ink/10 bg-card p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-display text-lg text-ink",
									children: "Similar Destinations"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 space-y-3",
									children: [
										{
											id: "balayan-heritage-houses",
											name: "Balayan Heritage Houses",
											category: "Colonial"
										},
										{
											id: "calatagan-ruins",
											name: "Calatagan Ruins",
											category: "Colonial"
										},
										{
											id: "fortune-island",
											name: "Fortune Island Ruins",
											category: "Colonial"
										}
									].filter((s) => s.id !== id).slice(0, 3).map((similar) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/heritage/$id",
										params: { id: similar.id },
										className: "group flex items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-parchment/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium text-ink group-hover:text-accent",
											children: similar.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block text-xs text-ink-soft",
											children: similar.category
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4 rotate-180 text-ink-soft group-hover:text-accent" })]
									}, similar.id))
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { HeritageDetailsPage as component };
