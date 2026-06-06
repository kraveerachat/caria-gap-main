"use client";

/**
 * Two live 3D nexus spheres used purely as page decoration on the gateway.
 * Each is the real <InteractiveCareerSphere> in `isBackground` mode, which
 * strips every <Html> label, the DT/DC toggle, the tip, bloom and controls,
 * leaving only the glowing wireframe sphere.
 *
 * Spinning two WebGL contexts is heavy, so on small screens and for
 * reduced-motion users we fall back to a cheap CSS radial glow instead.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const InteractiveCareerSphere = dynamic(
  () => import("@/components/InteractiveCareerSphere"),
  { ssr: false }
);

function Glow({ tint }: { tint: "orange" | "blue" }) {
  return (
    <div
      className="absolute inset-[10%] rounded-full blur-3xl"
      style={{
        background:
          tint === "orange"
            ? "radial-gradient(circle, rgba(243,146,0,0.20), transparent 70%)"
            : "radial-gradient(circle, rgba(45,156,255,0.20), transparent 70%)",
      }}
    />
  );
}

export function GlobeBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const check = () => setLive(window.innerWidth >= 768 && !prefersReducedMotion);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [prefersReducedMotion]);

  return (
    <>
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] opacity-30">
        {live ? <InteractiveCareerSphere isBackground /> : <Glow tint="orange" />}
      </div>
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[80vw] w-[80vw] opacity-30">
        {live ? <InteractiveCareerSphere isBackground /> : <Glow tint="blue" />}
      </div>
    </>
  );
}
