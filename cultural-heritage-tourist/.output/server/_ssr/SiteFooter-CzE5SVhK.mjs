import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteFooter-CzE5SVhK.js
var import_jsx_runtime = require_jsx_runtime();
var exploreLinks = [
	{
		to: "/explore",
		label: "Destinations"
	},
	{
		to: "/map",
		label: "GIS Map"
	},
	{
		to: "/route-planner",
		label: "Routes"
	},
	{
		to: "/explore",
		label: "Categories"
	}
];
var travelerLinks = [
	{
		to: "/bookmarks",
		label: "Bookmarks"
	},
	{
		to: "/reviews",
		label: "Reviews"
	},
	{
		to: "/scanner",
		label: "QR Scanner"
	},
	{
		to: "/profile",
		label: "Profile"
	}
];
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-ink/10 bg-cream",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-1 md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									width: "16",
									height: "16",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-display text-lg tracking-tight",
								children: "Patrimonio"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-sm text-sm leading-relaxed text-ink-soft",
							children: "A living atlas of cultural heritage — mapping the places, stories, and journeys worth remembering."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-display text-sm text-ink",
						children: "Explore"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-2.5",
						children: exploreLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: link.to,
							className: "text-sm text-ink-soft transition-colors hover:text-accent",
							children: link.label
						}) }, link.to))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-display text-sm text-ink",
						children: "Traveler"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-2.5",
						children: travelerLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: link.to,
							className: "text-sm text-ink-soft transition-colors hover:text-accent",
							children: link.label
						}) }, link.to))
					})] })
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-ink/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ink-soft md:flex-row md:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "© 2026 Patrimonio Heritage Atlas" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono uppercase tracking-widest",
					children: "Est. MMXXVI · Trails of Memory"
				})]
			})
		})]
	});
}
//#endregion
export { SiteFooter as t };
