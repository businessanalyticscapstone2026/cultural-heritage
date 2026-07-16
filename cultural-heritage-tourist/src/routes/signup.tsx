import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "@/components/AuthForms";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return <SignupForm />;
}
