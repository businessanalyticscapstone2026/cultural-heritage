import { a as __toESM } from "../_runtime.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { E as Map, M as Info, N as House, i as User, k as Lock, p as Search, t as X, u as Shield, z as Compass } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./auth-D2gWtNPt.mjs";
import { _ as useNavigate, g as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Navbar-B_GQDJPv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPrompt({ open, onClose, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .95,
				y: 20
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				scale: .95,
				y: 20
			},
			transition: {
				duration: .3,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "relative w-full max-w-md rounded-3xl border border-ink/10 bg-background p-8 shadow-2xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-parchment/60 text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
						size: 24,
						strokeWidth: 1.4
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-display text-2xl text-center text-ink",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-sm text-ink-soft",
					children: description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signup",
						className: "rounded-xl bg-ink px-6 py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
						children: "Create free account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "rounded-xl border border-ink/15 px-6 py-3 text-center text-sm text-ink transition-colors hover:border-ink/30",
						children: "Already have an account? Log in"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-center text-xs text-ink-soft/60",
					children: "Free to join · No credit card required"
				})
			]
		})
	}) });
}
var navLinks = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/explore",
		label: "Explore",
		icon: Compass
	},
	{
		to: "/map",
		label: "Map",
		icon: Map
	},
	{
		to: "/about",
		label: "About",
		icon: Info
	}
];
function Navbar() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const { user } = useAuth();
	const [showAuthPrompt, setShowAuthPrompt] = (0, import_react.useState)(false);
	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate({
				to: "/explore",
				search: { q: searchQuery.trim() }
			});
			setSearchQuery("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPrompt, {
			open: showAuthPrompt,
			onClose: () => setShowAuthPrompt(false),
			title: "Sign in to view your profile",
			description: "Create a free account to save destinations, write reviews, and track your heritage journeys."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "fixed inset-x-0 top-0 z-50 hidden border-b border-ink/10 bg-cream/80 backdrop-blur-xl md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
								size: 16,
								strokeWidth: 1.5
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-display text-lg tracking-tight",
							children: "Patrimonio"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex items-center gap-1",
						children: navLinks.map((link) => {
							const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: active ? "rounded-full px-4 py-1.5 text-sm font-medium text-accent transition-colors" : "rounded-full px-4 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink",
								children: link.label
							}, link.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleSearch,
							className: "relative hidden lg:block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								size: 14,
								strokeWidth: 1.5,
								className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "Search sites...",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value),
								className: "w-48 rounded-full border border-ink/10 bg-background py-1.5 pl-9 pr-3 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent/40 focus:w-64 transition-all"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => user ? navigate({ to: "/profile" }) : setShowAuthPrompt(true),
							className: "grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:border-accent hover:text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
								size: 16,
								strokeWidth: 1.5
							})
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream/95 backdrop-blur-xl md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
				children: navLinks.map((tab) => {
					const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: tab.to,
						className: "flex flex-1 flex-col items-center gap-0.5 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, {
							size: 20,
							strokeWidth: 1.5,
							className: active ? "text-accent" : "text-ink-soft"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: active ? "text-[10px] font-medium text-accent" : "text-[10px] text-ink-soft",
							children: tab.label
						})]
					}, tab.to);
				})
			})
		})
	] });
}
//#endregion
export { Navbar as n, AuthPrompt as t };
