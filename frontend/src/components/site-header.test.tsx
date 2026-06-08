import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, status: "unauthenticated" as string },
}));

vi.mock("next-auth/react", () => ({
  useSession: () => mocks.session,
  signOut: vi.fn(),
}));
vi.mock("@/components/language-provider", () => ({
  useLanguage: () => ({
    lang: "en",
    t: { nav: { howItWorks: "How", assessment: "Assess", results: "Results", simulator: "Sim", start: "Start" } },
  }),
}));
// Presentational deps stubbed so the test isolates the auth control.
vi.mock("@/components/logo", () => ({ Logo: () => <div /> }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <div /> }));
vi.mock("@/components/language-toggle", () => ({ LanguageToggle: () => <div /> }));
vi.mock("motion/react", () => ({
  motion: new Proxy({}, { get: () => ({ children }: { children?: unknown }) => <div>{children}</div> }),
}));

import { SiteHeader } from "./site-header";

describe("SiteHeader auth control", () => {
  beforeEach(() => {
    mocks.session.data = null;
    mocks.session.status = "unauthenticated";
  });

  it("shows a Sign in link when unauthenticated", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows only the profile avatar (no name, no inline Sign out) when authenticated", () => {
    mocks.session.data = { user: { name: "Somchai", role: "student" } };
    mocks.session.status = "authenticated";
    render(<SiteHeader />);
    // The avatar is the sole account indicator and links to the profile page.
    const avatar = screen.getByRole("link", { name: "My profile" });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("href", "/profile");
    // The crowding name text and inline Sign out link/button are gone.
    expect(screen.queryByText("Somchai")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });
});
