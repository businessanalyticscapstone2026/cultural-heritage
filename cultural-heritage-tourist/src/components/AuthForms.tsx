import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

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
  const [error, setError] = useState("");

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
