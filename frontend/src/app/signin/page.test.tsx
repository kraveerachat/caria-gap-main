import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, status: "unauthenticated" as string },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => mocks.session,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getProviders: () => Promise.resolve({}),
}));

import SignInPage from "./page";

describe("SignInPage", () => {
  beforeEach(() => {
    mocks.session.data = null;
    mocks.session.status = "unauthenticated";
  });

  it("renders the SUT-ID sign-in form when unauthenticated", () => {
    render(<SignInPage />);
    expect(screen.getByText("Sign in to SUT-CARIA")).toBeInTheDocument();
    expect(screen.getByLabelText("SUT Student ID")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with student id/i }),
    ).toBeInTheDocument();
  });

  it("shows the signed-in state when authenticated", () => {
    mocks.session.data = { user: { name: "Somchai", role: "student" } };
    mocks.session.status = "authenticated";
    render(<SignInPage />);
    expect(screen.getByText("You are signed in")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to dashboard/i }),
    ).toBeInTheDocument();
  });
});
