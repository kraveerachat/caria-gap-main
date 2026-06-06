"use client";

// TanStack Query provider (Roadmap Phase 3). Hosts the client-side cache for
// authed/dynamic data (assessment, recommendations, gap analysis). Reference
// data stays on RSC fetch; this is for the interactive, per-user calls.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
