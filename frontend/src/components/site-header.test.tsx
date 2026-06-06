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

  it("shows the user name and Sign out when authenticated", () => {
    mocks.session.data = { user: { name: "Somchai", role: "student" } };
    mocks.session.status = "authenticated";
    render(<SiteHeader />);
    expect(screen.getByText("Somchai")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });
});
