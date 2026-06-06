"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { DT_BRANCH, DC_BRANCH, CareerGroup, CareerItem } from "@/lib/careers-list";
import { useLanguage } from "@/components/language-provider";
import { Lightbulb } from "lucide-react";

const RADIUS = 2.5;
const COLOR_ORANGE = new THREE.Color("#F39200"); // SUT Orange
const COLOR_BLUE = new THREE.Color("#2D9CFF");   // Nexus Blue
const COLOR_ORANGE_LIGHT = new THREE.Color("#E0700A");
const COLOR_BLUE_LIGHT = new THREE.Color("#2563EB");

// Helper positions for the labels on the sphere to prevent overlaps
const DT_DIRECTIONS: [number, number, number][] = [
  [0.6, 0.4, 0.45],    // Software Development 1 (Web Apps) - upper front
  [0.6, 0.4, -0.45],   // Software Development 2 (Mobile Apps) - upper back
  [0.75, 0.15, 0.1],   // Software Development 3 (Enterprise) - mid front-center
  [0.6, -0.4, 0.45],   // Data 1 (Data Handling) - lower front
  [0.6, -0.4, -0.45],  // Data 2 (Data Science) - lower back
  [0.75, -0.15, -0.1], // Infrastructure (Cloud/Network) - mid back-center
  [0.45, 0.75, 0.0]    // Entrepreneurship/Other - top-most center
];

const DC_DIRECTIONS: [number, number, number][] = [
  [-0.6, 0.5, 0.45],   // Group 1: Visual Design - upper right
  [-0.6, 0.5, -0.45],  // Group 2: Content Creator - upper left
  [-0.75, 0.25, 0.2],  // Group 3: Animation - mid-upper right
  [-0.75, 0.25, -0.2], // Group 4: Film & Video - mid-upper left
  [-0.6, -0.1, 0.5],   // Group 5: Game - mid-lower right
  [-0.6, -0.1, -0.5],  // Group 6: Media Planning - mid-lower left
  [-0.75, -0.4, 0.25], // Group 7: Marketing - lower right
  [-0.75, -0.4, -0.25],// Group 8: Reporting - lower left
  [-0.5, 0.75, 0.0],   // Group 9: Application - top-most center
  [-0.5, -0.75, 0.0]   // Group 10: Personalized/Research - bottom-most center
];

interface InteractiveCareerSphereProps {
  isExploring?: boolean;
  setIsExploring?: (val: boolean) => void;
  activeBranch?: "DT" | "DC";
  setActiveBranch?: (branch: "DT" | "DC") => void;
  selectedGroup?: string;
  setSelectedGroup?: (group: string) => void;
  selectedCareer?: string;
  setSelectedCareer?: (career: string) => void;
  /** Decorative mode: render only the wireframe sphere — no Html labels, no
      toggle/tip, no bloom/controls. Used as a page background. */
  isBackground?: boolean;
}

function getHemisphereDirections(count: number, branch: "DT" | "DC"): [number, number, number][] {
  if (count === 7) {
    if (branch === "DT") {
      return DT_DIRECTIONS;
    } else {
      return DT_DIRECTIONS.map(d => [-d[0], d[1], -d[2]] as [number, number, number]);
    }
  }
  
  if (count === 10 && branch === "DC") {
    return DC_DIRECTIONS;
  }
  
  // Dynamic distribution for other counts (e.g. 10 groups of DC)
  const dirs: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const y = -0.6 + 1.2 * t;
    
    const angle = i * 2.39996;
    const r = Math.sqrt(Math.max(0.1, 1 - y * y)) * 0.75;
    const z = Math.sin(angle) * r;
    const x = Math.cos(angle) * r;
    
    const posX = Math.abs(x) < 0.25 ? 0.25 + Math.abs(x) : Math.abs(x);
    const signX = branch === "DT" ? 1 : -1;
    
    dirs.push([posX * signX, y, z]);
  }
  return dirs;
}

interface NexusProps {
  light: boolean;
  activeBranch: "DT" | "DC";
  viewMode: "groups" | "careers";
  allGroups: (CareerGroup & { branch: "DT" | "DC" })[];
  lang: string;
  onNodeClick: (node: any) => void;
  isBackground: boolean;
}

function Nexus({ light, activeBranch, viewMode, allGroups, lang, onNodeClick, isBackground }: NexusProps) {
  const groupRef = useRef<THREE.Group>(null);
  const occluderRef = useRef<THREE.Mesh>(null);
  const prevBranchRef = useRef(activeBranch);
  const interactionTimeRef = useRef(0);

  // Dynamic nodes data depending on viewMode
  const nodesData = useMemo(() => {
    const isThai = lang === "th";
    
    if (viewMode === "careers") {
      // Landing state: 14 representative sub-careers (7 DT, 7 DC)
      const dtList: any[] = [];
      const dcList: any[] = [];
      
      const dtGroups = allGroups.filter(g => g.branch === "DT");
      const dcGroups = allGroups.filter(g => g.branch === "DC");
      
      const dtDirs = getHemisphereDirections(7, "DT");
      const dcDirs = getHemisphereDirections(7, "DC");
      
      dtGroups.forEach((g) => {
        if (g.careers.length > 0 && dtList.length < 7) {
          const c = g.careers[0];
          dtList.push({
            label: isThai ? (c.nameTh || c.name) : c.name,
            fullName: isThai ? `${c.nameTh || c.name} (${c.name})` : c.name,
            desc: isThai ? c.description : (c.descriptionEn || c.description),
            isGroup: false,
            branch: "DT",
            groupName: g.name,
            careerName: c.name,
            dir: dtDirs[dtList.length]
          });
        }
      });
      
      dcGroups.forEach((g) => {
        if (g.careers.length > 0 && dcList.length < 7) {
          const c = g.careers[0];
          dcList.push({
            label: isThai ? (c.nameTh || c.name) : c.name,
            fullName: isThai ? `${c.nameTh || c.name} (${c.name})` : c.name,
            desc: isThai ? c.description : (c.descriptionEn || c.description),
            isGroup: false,
            branch: "DC",
            groupName: g.name,
            careerName: c.name,
            dir: dcDirs[dcList.length]
          });
        }
      });
      
      return [...dtList, ...dcList];
    } else {
      // Exploring state: groups of the active branch
      const branchGroups = allGroups.filter(g => g.branch === activeBranch);
      const dirs = getHemisphereDirections(branchGroups.length, activeBranch);
      
      return branchGroups.map((g, idx) => {
        const groupLabel = g.name; // Always English name for Category Title
        
        return {
          label: groupLabel,
          fullName: groupLabel,
          desc: "",
          isGroup: true,
          branch: activeBranch,
          groupName: g.name,
          careerName: "",
          dir: dirs[idx]
        };
      });
    }
  }, [allGroups, lang, viewMode, activeBranch]);

  const { pointsGeo, linesGeo, dotTexture, labeledNodes } = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(RADIUS, isBackground ? 3 : 4);
    const raw = ico.attributes.position.array as Float32Array;
    const rawCount = raw.length / 3;

    // Weld duplicate vertices
    const keyToIndex = new Map<string, number>();
    const verts: number[] = [];
    const rawToUnique = new Int32Array(rawCount);
    const P = 1e4;
    for (let i = 0; i < rawCount; i++) {
      const x = raw[i * 3], y = raw[i * 3 + 1], z = raw[i * 3 + 2];
      const key = `${Math.round(x * P)}_${Math.round(y * P)}_${Math.round(z * P)}`;
      let idx = keyToIndex.get(key);
      if (idx === undefined) {
        idx = verts.length / 3;
        keyToIndex.set(key, idx);
        verts.push(x, y, z);
      }
      rawToUnique[i] = idx;
    }
    const uniqueCount = verts.length / 3;

    // Per-vertex colors
    const cOrange = light ? COLOR_ORANGE_LIGHT : COLOR_ORANGE;
    const cBlue = light ? COLOR_BLUE_LIGHT : COLOR_BLUE;
    const colors = new Float32Array(uniqueCount * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < uniqueCount; i++) {
      const x = verts[i * 3];
      const m = THREE.MathUtils.smoothstep(x, -0.75, 0.75);
      tmp.copy(cOrange).lerp(cBlue, m);
      const b = light ? 0.7 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5;
      colors[i * 3] = tmp.r * b;
      colors[i * 3 + 1] = tmp.g * b;
      colors[i * 3 + 2] = tmp.b * b;
    }

    // Unique edges
    const edgeSet = new Set<string>();
    const linePos: number[] = [];
    const lineCol: number[] = [];
    const pushVert = (idx: number) => {
      linePos.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2]);
      lineCol.push(colors[idx * 3], colors[idx * 3 + 1], colors[idx * 3 + 2]);
    };
    for (let t = 0; t < rawCount; t += 3) {
      const tri: [number, number][] = [
        [rawToUnique[t], rawToUnique[t + 1]],
        [rawToUnique[t + 1], rawToUnique[t + 2]],
        [rawToUnique[t + 2], rawToUnique[t]],
      ];
      for (const [u, v] of tri) {
        const key = u < v ? `${u}_${v}` : `${v}_${u}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        pushVert(u);
        pushVert(v);
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    pGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));
    lGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineCol, 3));

    // Circular dot texture
    const s = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(canvas);

    // Map labels to nearest vertices with hemisphere separation
    const labeled = nodesData.map((node) => {
      const target = new THREE.Vector3(...node.dir);
      
      // DT (Technology) -> positive X, DC (Media) -> negative X
      if (node.branch === "DT") {
        target.x = Math.abs(target.x);
      } else {
        target.x = -Math.abs(target.x);
      }
      target.normalize().multiplyScalar(RADIUS);

      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < uniqueCount; i++) {
        const dx = verts[i * 3] - target.x;
        const dy = verts[i * 3 + 1] - target.y;
        const dz = verts[i * 3 + 2] - target.z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return {
        label: node.label,
        fullName: node.fullName,
        desc: node.desc,
        isGroup: node.isGroup,
        branch: node.branch,
        groupName: node.groupName,
        careerName: node.careerName,
        position: [verts[best * 3], verts[best * 3 + 1], verts[best * 3 + 2]] as [number, number, number],
      };
    });

    return { pointsGeo: pGeo, linesGeo: lGeo, dotTexture: tex, labeledNodes: labeled };
  }, [light, nodesData, isBackground]);

  // Smoothly damp rotation to face selected hemisphere, handle idle auto-rotation & scale breathing pulsation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // 1. Gentle breathing animation (scale pulsation)
      const scalePulsate = 1 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.035;
      groupRef.current.scale.setScalar(scalePulsate);
      
      // 2. Gentle floating animation (y-axis sway)
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.0) * 0.08;

      // Decorative background: skip branch-facing logic, just spin slowly.
      if (isBackground) {
        groupRef.current.rotation.y += delta * 0.12;
        return;
      }

      // 3. Reset interaction timer when activeBranch toggles
      if (prevBranchRef.current !== activeBranch) {
        prevBranchRef.current = activeBranch;
        interactionTimeRef.current = state.clock.getElapsedTime();
      }

      // 4. Smooth Rotation logic (DT faces front at -Math.PI / 2, DC at Math.PI / 2)
      const timeSinceInteraction = state.clock.getElapsedTime() - interactionTimeRef.current;
      const targetRotationY = activeBranch === "DT" ? -Math.PI / 2 : Math.PI / 2;
      
      let finalTargetY = targetRotationY;
      if (timeSinceInteraction > 4) {
        // Resume slow auto-rotation spin after 4 seconds of idle time
        const idleTime = timeSinceInteraction - 4;
        finalTargetY = targetRotationY + idleTime * 0.12;
      }

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        finalTargetY,
        2.5,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.16, 0, 0]}>
      {/* Occluder to hide rear nodes */}
      <mesh ref={occluderRef}>
        <sphereGeometry args={[RADIUS * 0.93, 48, 48]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      {/* Grid line plexus */}
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={light ? 0.4 : 0.15}
          depthWrite={false}
          toneMapped={false}
          blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Nodes points */}
      <points geometry={pointsGeo}>
        <pointsMaterial
          map={dotTexture}
          vertexColors
          size={0.06}
          sizeAttenuation
          transparent
          opacity={light ? 0.8 : 0.9}
          alphaTest={0.01}
          depthWrite={false}
          toneMapped={false}
          blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>

      {/* Text labels (skipped in decorative background mode — no Html nodes) */}
      {!isBackground && labeledNodes.map((node) => (
        <group key={node.label + node.fullName} position={node.position}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial 
              color={node.branch === "DT" ? (light ? "#2563EB" : "#60A5FA") : (light ? "#E0700A" : "#FFC14D")} 
              toneMapped={false} 
            />
          </mesh>
          <Html
            center
            distanceFactor={9}
            occlude={[occluderRef]}
            zIndexRange={[30, 0]}
          >
            <div
              onClick={() => onNodeClick(node)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white/90 shadow-[0_4px_18px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all hover:scale-105 ${
                node.branch === "DT"
                  ? "hover:border-blue-500/60 dark:hover:border-blue-400/60"
                  : "hover:border-brand-orange/60"
              } dark:border-white/10 dark:bg-[#070b14]/85 dark:shadow-[0_4px_24px_rgba(0,0,0,0.55)] text-slate-800 dark:text-white pointer-events-auto select-none cursor-pointer`}
            >
              <span 
                className={`w-1.5 h-1.5 rounded-full ${
                  node.branch === "DT"
                    ? "bg-blue-500 shadow-[0_0_8px_#2563EB]"
                    : "bg-brand-orange shadow-[0_0_8px_#F39200]"
                }`} 
              />
              <span className={`text-[10px] md:text-[11px] font-semibold whitespace-nowrap ${lang === "th" ? "font-thai leading-relaxed" : ""}`}>
                {node.label}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function InteractiveCareerSphere({
  isExploring = false,
  setIsExploring = () => {},
  activeBranch = "DT",
  setActiveBranch = () => {},
  selectedGroup = "",
  setSelectedGroup = () => {},
  selectedCareer = "",
  setSelectedCareer = () => {},
  isBackground = false,
}: InteractiveCareerSphereProps) {
  const [mounted, setMounted] = useState(false);
  const { lang } = useLanguage();
  const thai = lang === "th";

  const allGroups = useMemo(() => [
    ...DT_BRANCH.map(g => ({ ...g, branch: "DT" as const })),
    ...DC_BRANCH.map(g => ({ ...g, branch: "DC" as const }))
  ], []);

  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);

  const light = mounted && resolvedTheme === "light";

  const viewMode = isExploring ? "groups" : "careers";

  const handleNodeClick = (node: any) => {
    if (viewMode === "careers") {
      setActiveBranch(node.branch);
      setSelectedGroup(node.groupName);
      setSelectedCareer(node.careerName);
      setIsExploring(true);
    } else {
      setSelectedGroup(node.groupName);
      const grp = allGroups.find(g => g.name === node.groupName);
      if (grp && grp.careers.length > 0) {
        setSelectedCareer(grp.careers[0].name);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange/30 border-t-brand-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-2 overflow-visible">
      
      {/* Branch Toggle: DT vs DC (Positioned at top-right, shifted down and left) */}
      {/* Hidden when exploring to prevent duplicate controls */}
      {!isBackground && !isExploring && (
        <div className="absolute top-20 right-20 md:top-24 md:right-24 z-20 pointer-events-auto flex rounded-full border border-slate-200 dark:border-white/10 p-1 bg-white/60 dark:bg-black/40 backdrop-blur-md max-w-fit shadow-lg">
          <button
            onClick={() => {
              setActiveBranch("DT");
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
              activeBranch === "DT"
                ? "bg-[#2563EB] text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            DT
          </button>
          <button
            onClick={() => {
              setActiveBranch("DC");
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
              activeBranch === "DC"
                ? "bg-brand-orange text-[#050A14] shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            DC
          </button>
        </div>
      )}

      {/* Interactive tip overlay for landing */}
      {!isBackground && !isExploring && (
        <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 pointer-events-none text-center md:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 shadow-md backdrop-blur-xl animate-bounce dark:border-white/10 dark:bg-slate-900/60">
            <Lightbulb className="size-3.5 text-brand-orange" strokeWidth={2.25} aria-hidden />
            <span className={`text-[10px] font-medium text-slate-600 dark:text-slate-300 md:text-xs ${thai ? "font-thai leading-relaxed" : ""}`}>
              {thai ? "คลิกที่กลุ่มอาชีพบนลูกบอลเพื่อเจาะลึกวิชาเรียน" : "Click any career label to explore details"}
            </span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="flex-1 w-full min-h-[360px] md:min-h-[420px] relative z-10 overflow-visible">
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 55 }}
          gl={{ alpha: true, antialias: true }}
          dpr={isBackground ? [1, 1.5] : [1, 2]}
          style={{ background: "transparent", overflow: "visible" }}
        >
          <Nexus
            light={light}
            activeBranch={activeBranch}
            viewMode={viewMode}
            allGroups={allGroups}
            lang={lang}
            onNodeClick={handleNodeClick}
            isBackground={isBackground}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={!isBackground}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.4}
          />

          {!light && !isBackground && (
            <EffectComposer enableNormalPass={false}>
              <Bloom intensity={0.9} luminanceThreshold={0.4} luminanceSmoothing={0.5} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      </div>
    </div>
  );
}

