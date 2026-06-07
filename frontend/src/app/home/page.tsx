import { redirect } from "next/navigation";

// The landing page now lives at the root "/". Keep "/home" working for any
// existing links by redirecting it to the canonical landing.
export default function HomePage() {
  redirect("/");
}
