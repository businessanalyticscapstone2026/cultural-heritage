import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/AuthForms";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
