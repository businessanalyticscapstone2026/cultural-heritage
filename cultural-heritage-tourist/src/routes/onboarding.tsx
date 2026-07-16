import { createFileRoute, redirect } from "@tanstack/react-router";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("patrimonio_auth");
      if (!raw) throw redirect({ to: "/" });
      try {
        const user = JSON.parse(raw);
        if (user?.onboarded) throw redirect({ to: "/home" });
      } catch (e) {
        if (e && typeof e === "object" && "to" in e) throw e;
        throw redirect({ to: "/" });
      }
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  return <OnboardingFlow />;
}
