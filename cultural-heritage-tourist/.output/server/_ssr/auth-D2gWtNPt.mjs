import { a as __toESM } from "../_runtime.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-D2gWtNPt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(null);
var STORAGE_KEY = "patrimonio_auth";
function loadUser() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function saveUser(user) {
	if (typeof window === "undefined") return;
	if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	else localStorage.removeItem(STORAGE_KEY);
}
function AuthProvider({ children }) {
	const [state, setState] = (0, import_react.useState)({
		user: null,
		loading: true
	});
	(0, import_react.useEffect)(() => {
		setState({
			user: loadUser(),
			loading: false
		});
	}, []);
	const login = (0, import_react.useCallback)(async (email, _password) => {
		const existing = loadUser();
		if (existing && existing.email === email) {
			saveUser(existing);
			setState({
				user: existing,
				loading: false
			});
			return;
		}
		const user = {
			id: crypto.randomUUID(),
			name: email.split("@")[0],
			email,
			interests: [],
			onboarded: false
		};
		saveUser(user);
		setState({
			user,
			loading: false
		});
	}, []);
	const signup = (0, import_react.useCallback)(async (name, email, _password) => {
		const user = {
			id: crypto.randomUUID(),
			name,
			email,
			interests: [],
			onboarded: false
		};
		saveUser(user);
		setState({
			user,
			loading: false
		});
	}, []);
	const logout = (0, import_react.useCallback)(() => {
		saveUser(null);
		setState({
			user: null,
			loading: false
		});
	}, []);
	const completeOnboarding = (0, import_react.useCallback)((data) => {
		setState((prev) => {
			if (!prev.user) return prev;
			const updated = {
				...prev.user,
				interests: data.interests,
				onboarded: true,
				travelStyle: data.travelStyle,
				accessibilityPrefs: data.accessibilityPrefs,
				travelDistance: data.travelDistance,
				locationEnabled: data.locationEnabled
			};
			saveUser(updated);
			return {
				...prev,
				user: updated
			};
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			...state,
			login,
			signup,
			logout,
			completeOnboarding
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
//#endregion
export { useAuth as n, AuthProvider as t };
