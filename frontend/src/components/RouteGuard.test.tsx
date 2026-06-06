import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const m = vi.hoisted(() => ({
  sessionStatus: "unauthenticated" as string,
  mockStatus: "checking" as string,
}));

vi.mock("next-auth/react", () => ({ useSession: () => ({ status: m.sessionStatus }) }));
vi.mock("@/hooks/useMockAuth", () => ({ useMockAuth: () => m.mockStatus }));
vi.mock("@/components/RouteLoadingScreen", () => ({
  RouteLoadingScreen: () => <div>LOADING</div>,
}));

import { RouteGuard } from "./RouteGuard";

describe("RouteGuard (login optional)", () => {
  beforeEach(() => {
    m.sessionStatus = "unauthenticated";
    m.mockStatus = "checking";
  });

  it("shows the loader while the session is resolving", () => {
    m.sessionStatus = "loading";
    render(<RouteGuard><div>PROTECTED</div></RouteGuard>);
    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });

  it("renders children when authenticated, even without a gateway role", () => {
    m.sessionStatus = "authenticated";
    m.mockStatus = "checking";
    render(<RouteGuard><div>PROTECTED</div></RouteGuard>);
    expect(screen.getByText("PROTECTED")).toBeInTheDocument();
  });

  it("renders children for an anonymous guest who passed the gateway", () => {
    m.sessionStatus = "unauthenticated";
    m.mockStatus = "authed";
    render(<RouteGuard><div>PROTECTED</div></RouteGuard>);
    expect(screen.getByText("PROTECTED")).toBeInTheDocument();
  });

  it("shows the loader (redirecting) with no session and no role", () => {
    m.sessionStatus = "unauthenticated";
    m.mockStatus = "checking";
    render(<RouteGuard><div>PROTECTED</div></RouteGuard>);
    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });
});
