import { a as __toESM } from "../_runtime.mjs";
import { f as require_react } from "../_libs/@react-leaflet/core+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D2gWtNPt.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthForms-BBHCEGFY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthShell({ children, title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 flex-col justify-center px-6 py-12 md:px-16 lg:px-24",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-12 flex items-center gap-2",
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
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-display text-3xl leading-tight text-ink md:text-4xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-ink-soft",
						children: subtitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10",
						children
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden flex-1 items-center justify-center bg-parchment/40 lg:flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md px-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-ink/10 bg-cream text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "32",
							height: "32",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-display text-4xl leading-tight text-ink",
						children: [
							"Every stone",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"has a story."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-ink-soft",
						children: "Join a community of travelers preserving and exploring the Philippines' cultural heritage."
					})
				]
			})
		})]
	});
}
function LoginForm() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (!email || !password) {
			setError("Please fill in all fields.");
			return;
		}
		setLoading(true);
		try {
			await login(email, password);
			navigate({ to: "/onboarding" });
		} catch {
			setError("Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthShell, {
		title: "Welcome back.",
		subtitle: "Log in to continue your heritage journey.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-5",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@example.com",
					className: "w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1.5 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft",
						children: "Password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/forgot-password",
						className: "text-xs text-accent hover:text-ink",
						children: "Forgot password?"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "password",
					value: password,
					onChange: (e) => setPassword(e.target.value),
					placeholder: "••••••••",
					className: "w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: loading,
					className: "w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50",
					children: loading ? "Logging in…" : "Log in"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-center text-sm text-ink-soft",
			children: [
				"Don't have an account?",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/signup",
					className: "font-medium text-accent hover:text-ink",
					children: "Sign up"
				})
			]
		})]
	});
}
function SignupForm() {
	const { signup } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (!name || !email || !password) {
			setError("Please fill in all fields.");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		setLoading(true);
		try {
			await signup(name, email, password);
			navigate({ to: "/onboarding" });
		} catch {
			setError("Signup failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthShell, {
		title: "Create your account.",
		subtitle: "Start exploring heritage sites in minutes.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-5",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft",
					children: "Full name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Juan dela Cruz",
					className: "w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@example.com",
					className: "w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft",
					children: "Password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "password",
					value: password,
					onChange: (e) => setPassword(e.target.value),
					placeholder: "At least 6 characters",
					className: "w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: loading,
					className: "w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50",
					children: loading ? "Creating account…" : "Create account"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-center text-sm text-ink-soft",
			children: [
				"Already have an account?",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "font-medium text-accent hover:text-ink",
					children: "Log in"
				})
			]
		})]
	});
}
function ForgotPasswordForm() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email) return;
		setLoading(true);
		await new Promise((r) => setTimeout(r, 800));
		setSent(true);
		setLoading(false);
	};
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShell, {
		title: "Check your email.",
		subtitle: "We sent a password reset link to your inbox.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-accent/30 bg-accent/5 px-5 py-4 text-sm text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"If an account exists for ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: email }),
				", you'll receive a reset link shortly."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-4 inline-block text-accent hover:text-ink",
				children: "← Back to login"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthShell, {
		title: "Reset your password.",
		subtitle: "Enter your email and we'll send you a reset link.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft",
				children: "Email"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "email",
				value: email,
				onChange: (e) => setEmail(e.target.value),
				placeholder: "you@example.com",
				className: "w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: loading,
				className: "w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50",
				children: loading ? "Sending…" : "Send reset link"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-center text-sm text-ink-soft",
			children: [
				"Remember your password?",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "font-medium text-accent hover:text-ink",
					children: "Log in"
				})
			]
		})]
	});
}
//#endregion
export { LoginForm as n, SignupForm as r, ForgotPasswordForm as t };
