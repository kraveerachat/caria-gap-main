/**
 * CARIA-GAP Footer — Precision Instrument UI
 * Design: Minimalist dark, white text, floating CTA, SUT/SUT branding
 */
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer
      className="relative pt-24 pb-12 overflow-hidden"
      style={{ background: "#020609" }}
    >
      {/* Top divider glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(243,146,0,0.3), rgba(30,144,255,0.3), transparent)" }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(30,144,255,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Final CTA block */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ perspective: 800 }}
          className="text-center mb-20"
        >
          <h2 className="font-heading font-extrabold text-4xl lg:text-5xl text-white mb-4">
            Ready to Map Your
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #F39200, #FFB84D)" }}
            >
              Digital Future?
            </span>
          </h2>
          <p className="text-slate-500 mt-3 text-sm font-dm leading-relaxed max-w-sm">
            Join thousands of students who have discovered their optimal career path with SUT-CARIA's advisory platform.
          </p>
          <motion.a
            href="#assessment"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-heading font-bold text-[#050A14] text-base tracking-wide"
            style={{
              background: "linear-gradient(135deg, #F39200, #FFB84D)",
              boxShadow: "0 0 40px rgba(243,146,0,0.4), 0 8px 30px rgba(0,0,0,0.3)",
            }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(243,146,0,0.6), 0 8px 40px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <span>Start Your Assessment</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.a>
        </motion.div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/6"
        >
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9">
                <div
                  className="absolute inset-0 rounded-full border-2 border-[#F39200] flex items-center justify-center"
                  style={{ boxShadow: "0 0 10px rgba(243,146,0,0.4)" }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#F39200] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#050A14]" />
                  </div>
                </div>
              </div>
              <div>
                <span className="font-heading font-extrabold text-white text-lg">SUT</span>
                <span className="font-heading font-extrabold text-[#F39200] text-lg">-CARIA</span>
              </div>
            </div>
            <p className="text-sm font-dm text-white/40 leading-relaxed max-w-xs">
              AI-powered personalized career recommender system. Mapping digital competencies to career pathways with precision.
            </p>
            <p className="text-xs font-dm text-white/25 mt-3">
              Suranaree University of Technology · School of Digital Engineering
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading font-semibold text-white/60 text-xs tracking-widest uppercase mb-4">Platform</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/assessment" className="text-sm font-dm text-white/40 hover:text-white/80 transition-colors">
                  Assessment (แบบประเมิน)
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-sm font-dm text-white/40 hover:text-white/80 transition-colors">
                  Public Analytics (เทรนด์สถิติ)
                </Link>
              </li>
              <li>
                <Link href="/b2b-portal" className="text-sm font-dm text-white/40 hover:text-white/80 transition-colors">
                  B2B Talent Matcher (ฝั่ง HR)
                </Link>
              </li>
              {["Simulator", "Roadmap"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm font-dm text-white/40 hover:text-white/80 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Research */}
          <div>
            <h4 className="font-heading font-semibold text-white/60 text-xs tracking-widest uppercase mb-4">Research</h4>
            <ul className="flex flex-col gap-2.5">
              {["Methodology", "SFIA Framework", "66 Competencies", "Publications", "About"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm font-dm text-white/40 hover:text-white/80 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
        >
          <div className="text-slate-500 text-xs font-dm tracking-wide">
            © 2024 SUT-CARIA · Suranaree University of Technology · All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="text-xs font-dm text-white/25 hover:text-white/50 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
