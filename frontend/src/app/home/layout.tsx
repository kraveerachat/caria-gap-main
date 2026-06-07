import type { ReactNode } from "react";

// "/home" now redirects to the public landing at "/", so no route guard here.
export default function HomeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
