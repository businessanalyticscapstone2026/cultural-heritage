import { a as __toESM } from "../_runtime.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { m as ScanLine, t as X } from "../_libs/lucide-react.mjs";
import { t as AuthProvider } from "./auth-D2gWtNPt.mjs";
import { A as redirect, _ as useNavigate, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./explore-DuDV08C_.mjs";
import { t as Route$11 } from "./heritage._id-BJxJwwLU.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Html5Qrcode } from "../_libs/html5-qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BdQogzyi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-EcdPDWtD.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var SCANNER_ID = "qr-scanner-region";
function QRScannerFAB() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const scannerRef = (0, import_react.useRef)(null);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const scanner = new Html5Qrcode(SCANNER_ID);
		scannerRef.current = scanner;
		scanner.start({ facingMode: "environment" }, {
			fps: 10,
			qrbox: {
				width: 250,
				height: 250
			}
		}, (decodedText) => {
			scanner.stop().catch(() => {});
			setOpen(false);
			if (decodedText.startsWith("http")) window.location.href = decodedText;
			else if (decodedText.startsWith("/")) navigate({ to: decodedText });
			else navigate({
				to: "/explore",
				search: { q: decodedText }
			});
		}, () => {}).catch(() => {
			setError("Camera access denied or unavailable.");
		});
		return () => {
			if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
			scannerRef.current?.clear();
		};
	}, [open, navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => {
			setError(null);
			setOpen(true);
		},
		className: "fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden",
		"aria-label": "Scan QR code",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {
			size: 24,
			strokeWidth: 1.5
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 flex flex-col bg-ink md:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-primary-foreground",
					children: "Scan a QR code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
						setOpen(false);
					},
					className: "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: SCANNER_ID,
						className: "h-full w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-60 w-60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-0 h-8 w-8 border-t-2 border-l-2 border-accent rounded-tl-lg" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-0 top-0 h-8 w-8 border-t-2 border-r-2 border-accent rounded-tr-lg" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent rounded-bl-lg" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-accent rounded-br-lg" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									animate: { y: [
										0,
										230,
										0
									] },
									transition: {
										duration: 2.5,
										repeat: Infinity,
										ease: "easeInOut"
									},
									className: "absolute left-2 right-2 h-0.5 bg-accent/80 shadow-[0_0_12px_rgba(0,210,211,0.6)]"
								})
							]
						})
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 bg-ink/90 px-6 py-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-white",
							children: error
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setError(null);
								setOpen(false);
							},
							className: "mt-2 text-xs text-accent underline",
							children: "Dismiss"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-white/60",
					children: "Point your camera at a heritage site QR code to view details"
				})
			})
		]
	}) })] });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-display text-7xl",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-muted-foreground",
					children: "This heritage site could not be located."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground",
					children: "Return home"
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-display text-2xl",
					children: "Something interrupted the journey"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Please try again in a moment."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						router.invalidate();
						reset();
					},
					className: "mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground",
					children: "Try again"
				})
			]
		})
	});
}
var Route$10 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Patrimonio — Discover Living Heritage" },
			{
				name: "description",
				content: "An interactive guide to cultural heritage destinations. Explore, map, and route your next journey through history."
			},
			{
				property: "og:title",
				content: "Patrimonio — Discover Living Heritage"
			},
			{
				property: "og:description",
				content: "Explore heritage sites, interactive GIS maps, smart recommendations, and optimized tour routes."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$10.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRScannerFAB, {})] })
	});
}
var $$splitComponentImporter$7 = () => import("./signup-BRMWPpye.mjs");
var Route$9 = createFileRoute("/signup")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./profile-UquX4Y2o.mjs");
var Route$8 = createFileRoute("/profile")({
	beforeLoad: () => {
		if (typeof window !== "undefined") {
			const raw = localStorage.getItem("patrimonio_auth");
			if (!raw) throw redirect({ to: "/" });
			try {
				if (!JSON.parse(raw)?.onboarded) throw redirect({ to: "/onboarding" });
			} catch (e) {
				if (e && typeof e === "object" && "to" in e) throw e;
				throw redirect({ to: "/" });
			}
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./onboarding-D2CYdKP_.mjs");
var Route$7 = createFileRoute("/onboarding")({
	beforeLoad: () => {
		if (typeof window !== "undefined") {
			const raw = localStorage.getItem("patrimonio_auth");
			if (!raw) throw redirect({ to: "/" });
			try {
				if (JSON.parse(raw)?.onboarded) throw redirect({ to: "/home" });
			} catch (e) {
				if (e && typeof e === "object" && "to" in e) throw e;
				throw redirect({ to: "/" });
			}
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./map-jFQL3i0z.mjs");
var Route$6 = createFileRoute("/map")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./login-DV2ubAZU.mjs");
var Route$5 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./home-BU3PDhf6.mjs");
var Route$4 = createFileRoute("/home")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./forgot-password-DkWIR-A_.mjs");
var Route$3 = createFileRoute("/forgot-password")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./about-Db1TmAP1.mjs");
var Route$2 = createFileRoute("/about")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$1 = createFileRoute("/")({ beforeLoad: () => {
	if (typeof window !== "undefined") {
		const raw = localStorage.getItem("patrimonio_auth");
		if (raw) try {
			if (!JSON.parse(raw)?.onboarded) throw redirect({ to: "/onboarding" });
		} catch (e) {
			if (e && typeof e === "object" && "to" in e) throw e;
		}
	}
	throw redirect({ to: "/home" });
} });
var SignupRoute = Route$9.update({
	id: "/signup",
	path: "/signup",
	getParentRoute: () => Route$10
});
var ProfileRoute = Route$8.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$10
});
var OnboardingRoute = Route$7.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => Route$10
});
var MapRoute = Route$6.update({
	id: "/map",
	path: "/map",
	getParentRoute: () => Route$10
});
var LoginRoute = Route$5.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$10
});
var HomeRoute = Route$4.update({
	id: "/home",
	path: "/home",
	getParentRoute: () => Route$10
});
var ForgotPasswordRoute = Route$3.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$10
});
var ExploreRoute = Route.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => Route$10
});
var AboutRoute = Route$2.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$10
});
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$10
	}),
	AboutRoute,
	ExploreRoute,
	ForgotPasswordRoute,
	HomeRoute,
	LoginRoute,
	MapRoute,
	OnboardingRoute,
	ProfileRoute,
	SignupRoute,
	HeritageIdRoute: Route$11.update({
		id: "/heritage/$id",
		path: "/heritage/$id",
		getParentRoute: () => Route$10
	})
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
