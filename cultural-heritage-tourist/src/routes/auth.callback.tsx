import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { hydrateSupabaseUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        window.location.replace("/login?reason=oauth-error");
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        window.location.replace("/login?reason=oauth-error");
        return;
      }

      const supabaseUser = data.session.user;
      const { data: touristProfile } = await supabase
        .from("tourist_profiles")
        .select("onboarding_completed_at")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      const name =
        (supabaseUser.user_metadata?.full_name as string | undefined) ??
        (supabaseUser.user_metadata?.name as string | undefined) ??
        supabaseUser.email?.split("@")[0] ??
        "Traveler";

      hydrateSupabaseUser(
        { id: supabaseUser.id, name, email: supabaseUser.email ?? "" },
        Boolean(touristProfile?.onboarding_completed_at),
      );

      navigate({ to: touristProfile?.onboarding_completed_at ? "/home" : "/onboarding" });
    })();
  }, [navigate, hydrateSupabaseUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
    </div>
  );
}
