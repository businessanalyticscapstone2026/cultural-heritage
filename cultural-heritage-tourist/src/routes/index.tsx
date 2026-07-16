import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("patrimonio_auth");
      if (raw) {
        try {
          const user = JSON.parse(raw);
          if (!user?.onboarded) throw redirect({ to: "/onboarding" });
        } catch (e) {
          if (e && typeof e === "object" && "to" in e) throw e;
        }
      }
    }
    throw redirect({ to: "/home" });
  },
});
