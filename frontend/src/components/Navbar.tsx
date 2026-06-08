/**
 * CARIA-GAP Navbar — Precision Instrument UI
 * Design: Glassmorphism sticky nav, circular logo, pill CTA
 * Dark base: #050A14 | Accent: #F39200
 */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Assessment", href: "#assessment" },
  { label: "Results", href: "#results" },
  { label: "Simulator", href: "#simulator" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ opacity: 1 }}
    >
      <motion.div
        className="glass-nav"
        style={{ opacity: bgOpacity }}
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#"
          className="flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Circular geometric logo */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#F39200] flex items-center justify-center"
              style={{ boxShadow: "0 0 12px rgba(243,146,0,0.5)" }}>
              <div className="w-5 h-5 rounded-full bg-[#F39200] opacity-90 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#050A14]" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full border border-[#1E90FF] opacity-40 scale-125" />
          </div>
          <div>
            <span className="font-heading font-800 text-white text-lg tracking-tight">CARIA</span>
            <span className="font-heading font-800 text-[#F39200] text-lg tracking-tight">-GAP</span>
          </div>
        </motion.a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="text-sm font-dm text-white/60 hover:text-white transition-colors relative group"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#F39200] group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <motion.a
            href="#assessment"
            className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F39200] text-[#050A14] font-heading font-700 text-sm tracking-wide"
            style={{ boxShadow: "0 0 20px rgba(243,146,0,0.35)" }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(243,146,0,0.55)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Start Assessment
          </motion.a>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="block w-6 h-0.5 bg-white"
              animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-white"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-white"
              animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden glass-panel border-t border-white/5"
        initial={false}
        animate={mobileOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/70 hover:text-white font-dm text-sm py-2 border-b border-white/5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#assessment"
            className="mt-2 text-center px-6 py-3 rounded-full bg-[#F39200] text-[#050A14] font-heading font-700 text-sm"
            onClick={() => setMobileOpen(false)}
          >
            Start Assessment
          </a>
        </div>
      </motion.div>
    </motion.header>
  );
}
