globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/about-nsqYmq90.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e23-dg8Io9LB/dfU+b4EW4tIY9kR65U\"",
		"mtime": "2026-07-15T16:32:47.429Z",
		"size": 7715,
		"path": "../public/assets/about-nsqYmq90.js"
	},
	"/assets/accessibility-CeyaXMOa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14c-+WOkQ96mH1SNVdQprirXKQj+1v0\"",
		"mtime": "2026-07-15T16:32:47.431Z",
		"size": 332,
		"path": "../public/assets/accessibility-CeyaXMOa.js"
	},
	"/assets/AuthForms-CYXVrl8g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2126-+2jtct6WYRSBnB2Z0YuYrm7fMv8\"",
		"mtime": "2026-07-15T16:32:47.421Z",
		"size": 8486,
		"path": "../public/assets/AuthForms-CYXVrl8g.js"
	},
	"/assets/auth-r4Vtyji5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"60c8-zJNoxGuy/D5GFxG29ho1U/JF710\"",
		"mtime": "2026-07-15T16:32:47.431Z",
		"size": 24776,
		"path": "../public/assets/auth-r4Vtyji5.js"
	},
	"/assets/chevron-right-DeTlqYbQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-xH+6JEc56QXZBs79gZgDm+tW/mY\"",
		"mtime": "2026-07-15T16:32:47.442Z",
		"size": 119,
		"path": "../public/assets/chevron-right-DeTlqYbQ.js"
	},
	"/assets/chevron-down-M5t71Arh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"75-SgPBSw+efNPu0FuYWlIo5YGUOhw\"",
		"mtime": "2026-07-15T16:32:47.440Z",
		"size": 117,
		"path": "../public/assets/chevron-down-M5t71Arh.js"
	},
	"/assets/clock-3H8qNtLr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e-0SEFFa1A9hYSfN+O/Iv51ZS/tTc\"",
		"mtime": "2026-07-15T16:32:47.442Z",
		"size": 158,
		"path": "../public/assets/clock-3H8qNtLr.js"
	},
	"/assets/dest-2-D-xl_mC_.jpg": {
		"type": "image/jpeg",
		"etag": "\"1378a-lHMjnVuatMQP6QByY5KbQ0FwDrY\"",
		"mtime": "2026-07-15T16:32:47.826Z",
		"size": 79754,
		"path": "../public/assets/dest-2-D-xl_mC_.jpg"
	},
	"/assets/dest-3-DI8ksQfa.jpg": {
		"type": "image/jpeg",
		"etag": "\"1a8eb-jKufT9E53pMM+1ydtJEPlwl88sc\"",
		"mtime": "2026-07-15T16:32:47.828Z",
		"size": 108779,
		"path": "../public/assets/dest-3-DI8ksQfa.jpg"
	},
	"/assets/dest-4-BgBYrTwi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-6kVFmof0ZqB2J3vcM7tNTFKpdyQ\"",
		"mtime": "2026-07-15T16:32:47.444Z",
		"size": 163,
		"path": "../public/assets/dest-4-BgBYrTwi.js"
	},
	"/assets/dest-1-CHXimXvg.jpg": {
		"type": "image/jpeg",
		"etag": "\"27046-lclpR2PFuhFK2P+dGiV2yoJT5Ds\"",
		"mtime": "2026-07-15T16:32:47.826Z",
		"size": 159814,
		"path": "../public/assets/dest-1-CHXimXvg.jpg"
	},
	"/assets/explore-KI34QN9_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"309-GZO3wbFR40ktKMmpmUypE1XdL/Q\"",
		"mtime": "2026-07-15T16:32:47.444Z",
		"size": 777,
		"path": "../public/assets/explore-KI34QN9_.js"
	},
	"/assets/explore-tfF7uwL4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22b6-WdpK9dQxMaf8dEUwbZ+7FuckMxs\"",
		"mtime": "2026-07-15T16:32:47.446Z",
		"size": 8886,
		"path": "../public/assets/explore-tfF7uwL4.js"
	},
	"/assets/dest-4-BY2VTp6E.jpg": {
		"type": "image/jpeg",
		"etag": "\"211ed-KPq8d/3ogmcOme4EmtveQ6W+Udw\"",
		"mtime": "2026-07-15T16:32:47.828Z",
		"size": 135661,
		"path": "../public/assets/dest-4-BY2VTp6E.jpg"
	},
	"/assets/forgot-password-T2LyMt-S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"99-t5JsNb2GHtzDT7VMvrmvl3uHjB0\"",
		"mtime": "2026-07-15T16:32:47.446Z",
		"size": 153,
		"path": "../public/assets/forgot-password-T2LyMt-S.js"
	},
	"/assets/heritage._id-Bg2JXFIb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f40-g/aeGIZ4OlasCjc1kCV2nB0rPc0\"",
		"mtime": "2026-07-15T16:32:47.490Z",
		"size": 16192,
		"path": "../public/assets/heritage._id-Bg2JXFIb.js"
	},
	"/assets/heart-DcRpEDnM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f7-DFc3yeioFNY3S7iwEfoOwZKuHl0\"",
		"mtime": "2026-07-15T16:32:47.490Z",
		"size": 247,
		"path": "../public/assets/heart-DcRpEDnM.js"
	},
	"/assets/heritage._id-BkWiT9nX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30c-kUW5bmyOJWIyNboUxMUZt39w2jA\"",
		"mtime": "2026-07-15T16:32:47.492Z",
		"size": 780,
		"path": "../public/assets/heritage._id-BkWiT9nX.js"
	},
	"/assets/home-BRIV5aFy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"960a-VNX7plCWAZ66C+kiq1qE1NR3IHI\"",
		"mtime": "2026-07-15T16:32:47.497Z",
		"size": 38410,
		"path": "../public/assets/home-BRIV5aFy.js"
	},
	"/assets/bookmark-DgY0C4Bl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db-TDyUocfW02vYvpkWaft0XNiNwEU\"",
		"mtime": "2026-07-15T16:32:47.439Z",
		"size": 219,
		"path": "../public/assets/bookmark-DgY0C4Bl.js"
	},
	"/assets/InteractiveMap-bmqIuS8c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b6d5-QBwp8/5eUraT9CGctGXvTDdiWTk\"",
		"mtime": "2026-07-15T16:32:47.423Z",
		"size": 177877,
		"path": "../public/assets/InteractiveMap-bmqIuS8c.js"
	},
	"/assets/InteractiveMap-vh-t_kPv.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"3af7-hJRdDJQQrsTdSxJ69xb7a611WZ4\"",
		"mtime": "2026-07-15T16:32:47.825Z",
		"size": 15095,
		"path": "../public/assets/InteractiveMap-vh-t_kPv.css"
	},
	"/assets/hero-heritage-DMbFUw3k.jpg": {
		"type": "image/jpeg",
		"etag": "\"50bb6-Ef9UnoJkN1Lk+EH3Dj06E2ImOIA\"",
		"mtime": "2026-07-15T16:32:47.979Z",
		"size": 330678,
		"path": "../public/assets/hero-heritage-DMbFUw3k.jpg"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-07-15T05:46:19.764Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/index-_KFQEKqW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5f1e-iF30lLM6/SU/45+eKJUSMEWBCDo\"",
		"mtime": "2026-07-15T16:32:47.421Z",
		"size": 679710,
		"path": "../public/assets/index-_KFQEKqW.js"
	},
	"/assets/jsx-runtime-BCldrbVS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2fa9-/bvMVGHfdh5F/jn2ZgOM+OTWE3Y\"",
		"mtime": "2026-07-15T16:32:47.497Z",
		"size": 12201,
		"path": "../public/assets/jsx-runtime-BCldrbVS.js"
	},
	"/assets/landmark-Wp1wjIvM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185-xI8NO5FXV/+X39en2OjH1pazxF0\"",
		"mtime": "2026-07-15T16:32:47.497Z",
		"size": 389,
		"path": "../public/assets/landmark-Wp1wjIvM.js"
	},
	"/assets/lazyRouteComponent-DFTfEYiw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1196-rd3V6akj97/cbKQifxLgZyotVc0\"",
		"mtime": "2026-07-15T16:32:47.497Z",
		"size": 4502,
		"path": "../public/assets/lazyRouteComponent-DFTfEYiw.js"
	},
	"/assets/login-BS5AcqeR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e-h08xTNH80Jjgv/edHCaVKP1W5LQ\"",
		"mtime": "2026-07-15T16:32:47.499Z",
		"size": 158,
		"path": "../public/assets/login-BS5AcqeR.js"
	},
	"/assets/map-1PCxhZdL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"491c-29k7RvvG8OCEhvFfw8fSzmW572w\"",
		"mtime": "2026-07-15T16:32:47.499Z",
		"size": 18716,
		"path": "../public/assets/map-1PCxhZdL.js"
	},
	"/assets/map-pin-B38jnTrk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f8-YqG4ffKXffW5qVAk1fzFxGCs6TY\"",
		"mtime": "2026-07-15T16:32:47.501Z",
		"size": 248,
		"path": "../public/assets/map-pin-B38jnTrk.js"
	},
	"/assets/map-texture-CTix3ezk.jpg": {
		"type": "image/jpeg",
		"etag": "\"32828-tZmDtscdMaMueLLlV9Yo7Jjoj94\"",
		"mtime": "2026-07-15T16:32:47.979Z",
		"size": 206888,
		"path": "../public/assets/map-texture-CTix3ezk.jpg"
	},
	"/assets/Navbar-COGNjFi0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18cc-XcbYtlsoPu99Xv8jFd/ogAibKbE\"",
		"mtime": "2026-07-15T16:32:47.423Z",
		"size": 6348,
		"path": "../public/assets/Navbar-COGNjFi0.js"
	},
	"/assets/navigation-CzNZVi-U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"89-K95nV2po2/xozd3kzGcl/UDLGm0\"",
		"mtime": "2026-07-15T16:32:47.503Z",
		"size": 137,
		"path": "../public/assets/navigation-CzNZVi-U.js"
	},
	"/assets/onboarding-DJpjPQXZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4246-0n2RgACpPnmgQkse9JI36CX3rys\"",
		"mtime": "2026-07-15T16:32:47.505Z",
		"size": 16966,
		"path": "../public/assets/onboarding-DJpjPQXZ.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-07-15T16:32:47.588Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profile-CSmdaRnh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3347-NMwjCQUJr1PgGGtgjY2haD4kOyk\"",
		"mtime": "2026-07-15T16:32:47.595Z",
		"size": 13127,
		"path": "../public/assets/profile-CSmdaRnh.js"
	},
	"/assets/signup-BsSS7gyW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e-Hfzf2IjS2vnReH0C3shYVavn2/Y\"",
		"mtime": "2026-07-15T16:32:47.598Z",
		"size": 158,
		"path": "../public/assets/signup-BsSS7gyW.js"
	},
	"/assets/react-C-n2S0ga.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ed3f-DcyXGGbOh30yuQMJRLvkl+6gC7M\"",
		"mtime": "2026-07-15T16:32:47.597Z",
		"size": 126271,
		"path": "../public/assets/react-C-n2S0ga.js"
	},
	"/assets/SiteFooter-uwLdulNi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98d-NrQ8lvveeY2C6nOgn5GBfn2NfB8\"",
		"mtime": "2026-07-15T16:32:47.425Z",
		"size": 2445,
		"path": "../public/assets/SiteFooter-uwLdulNi.js"
	},
	"/assets/sliders-horizontal-CMemEPHQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19d-5wpizq2yNbWg3Uk/In7FqR6EOeU\"",
		"mtime": "2026-07-15T16:32:47.610Z",
		"size": 413,
		"path": "../public/assets/sliders-horizontal-CMemEPHQ.js"
	},
	"/assets/star-B2KcjaKp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cd-baWj76hl9kj/0LSUr4QJWeVAj2g\"",
		"mtime": "2026-07-15T16:32:47.682Z",
		"size": 461,
		"path": "../public/assets/star-B2KcjaKp.js"
	},
	"/assets/tag-X94JGEdV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b-VHQ69Q8H19StPUXO6oLFqEkt25E\"",
		"mtime": "2026-07-15T16:32:47.790Z",
		"size": 315,
		"path": "../public/assets/tag-X94JGEdV.js"
	},
	"/assets/tree-pine-BANmuURQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"383-Pt92YqOnQ7ygmhw0zpfhyYK9ufw\"",
		"mtime": "2026-07-15T16:32:47.818Z",
		"size": 899,
		"path": "../public/assets/tree-pine-BANmuURQ.js"
	},
	"/assets/styles-EcdPDWtD.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1b9ae-l28RgT4O+pj611Qcg33K0VqhV/4\"",
		"mtime": "2026-07-15T16:32:47.979Z",
		"size": 113070,
		"path": "../public/assets/styles-EcdPDWtD.css"
	},
	"/assets/useMatch-DluX-4j9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26e-rVLazQ2nxin9iY9QqJe7MViVwf8\"",
		"mtime": "2026-07-15T16:32:47.822Z",
		"size": 622,
		"path": "../public/assets/useMatch-DluX-4j9.js"
	},
	"/assets/users-BXrqBKoe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-JIfPpXtY7eDzDV9+S9idxGmsVQM\"",
		"mtime": "2026-07-15T16:32:47.823Z",
		"size": 295,
		"path": "../public/assets/users-BXrqBKoe.js"
	},
	"/assets/x-DzqAXKhs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8f-Tnf0LRMDp1XuypUDR5G3WGZrfXk\"",
		"mtime": "2026-07-15T16:32:47.825Z",
		"size": 143,
		"path": "../public/assets/x-DzqAXKhs.js"
	},
	"/assets/user-Bf96Ww1t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b9-ecUhnKxfGCXk4IJaBHpr67gS2D4\"",
		"mtime": "2026-07-15T16:32:47.822Z",
		"size": 185,
		"path": "../public/assets/user-Bf96Ww1t.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_rtYbLz = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_rtYbLz
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
