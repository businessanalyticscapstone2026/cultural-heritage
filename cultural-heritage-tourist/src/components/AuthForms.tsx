import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-12 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" />
              </svg>
            </span>
            <span className="text-display text-lg tracking-tight">Batangas Heritage</span>
          </Link>
          <h1 className="text-display text-3xl leading-tight text-ink md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
      {/* Right: decorative */}
      <div className="hidden flex-1 items-center justify-center bg-parchment/40 lg:flex">
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-ink/10 bg-cream text-accent">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 2 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" />
            </svg>
          </div>
          <h2 className="text-display text-4xl leading-tight text-ink">
            Every stone<br />has a story.
          </h2>
          <p className="mt-4 text-sm text-ink-soft">
            Join a community of travelers preserving and exploring the Philippines' cultural heritage.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "oauth-error") {
      setError("Unable to sign in with Google. Please try again.");
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
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

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError("Unable to sign in with Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back." subtitle="Log in to continue your heritage journey.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Password</label>
            <Link to="/forgot-password" className="text-xs text-accent hover:text-ink">Forgot password?</Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="text-xs text-ink-soft">or</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-parchment/40 disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.86-2.98c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.26 21.3 7.31 24 12 24Z" />
          <path fill="#FBBC05" d="M5.27 14.28A7.14 7.14 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.28A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.28 5.37l3.99-3.09Z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.63l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
        </svg>
        {googleLoading ? "Signing in…" : "Sign in with Google"}
      </button>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-accent hover:text-ink">Sign up</Link>
      </p>
    </AuthShell>
  );
}

export function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
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

  return (
    <AuthShell title="Create your account." subtitle="Start exploring heritage sites in minutes.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan dela Cruz"
            className="w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-accent hover:text-ink">Log in</Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthShell title="Check your email." subtitle="We sent a password reset link to your inbox.">
        <div className="rounded-xl border border-accent/30 bg-accent/5 px-5 py-4 text-sm text-ink">
          <p>If an account exists for <strong>{email}</strong>, you&apos;ll receive a reset link shortly.</p>
          <Link to="/login" className="mt-4 inline-block text-accent hover:text-ink">← Back to login</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password." subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-soft">
        Remember your password?{" "}
        <Link to="/login" className="font-medium text-accent hover:text-ink">Log in</Link>
      </p>
    </AuthShell>
  );
}
