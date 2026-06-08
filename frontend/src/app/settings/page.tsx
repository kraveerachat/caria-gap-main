import { redirect } from "next/navigation";

/**
 * `/settings` is consolidated into the state-aware account hub at `/profile`
 * (Student ID card / guest profile, sign-out, and assessment-history controls).
 */
export default function SettingsPage() {
  redirect("/profile");
}
