"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Scan, Sparkles, Activity, ShieldCheck, ChevronRight, Layers, TrendingUp } from "lucide-react";
import { ParticleFluidCanvas } from "./ParticleFluidCanvas";

interface BioHeroProps {
  onAnalyzeLeaf: () => void;
  onExploreCoverage: () => void;
  onViewMetrics: () => void;
}

export function BioPrismHero({
  onAnalyzeLeaf,
  onExploreCoverage,
  onViewMetrics,
}: BioHeroProps) {
  const stats = [
    { value: "62", label: "Pathology Classes", detail: "Deep multi-class foliar taxonomy" },
    { value: "20", label: "Active Crops", detail: "Vision-classified agricultural species" },
    { value: "26", label: "FAO Yield Crops", detail: "Global harvest benchmarks" },
    { value: "96.6%", label: "Test Accuracy", detail: "4,249 verified holdout leaves" },
  ];

  const features = [
    {
      icon: Activity,
      title: "Neural Vision Diagnosis",
      desc: "Instant pathogen identification across 62 foliar disease classes with verified confidence distributions.",
    },
    {
      icon: Layers,
      title: "Grad-CAM Heatmaps",
      desc: "Pixel-level explainability highlighting exact symptomatic cellular regions that activated the model.",
    },
    {
      icon: TrendingUp,
      title: "Agro-Climatic Yield Model",
      desc: "RandomForest regressor trained on 31,621 FAO records projecting harvest tonnes per hectare.",
    },
  ];

  return (
    <section className="relative min-h-[96vh] w-full flex flex-col justify-between bg-[#000000] text-[#F3F5EC] px-6 sm:px-10 pt-32 sm:pt-38 pb-14 overflow-hidden selection:bg-[#B7F36B] selection:text-[#071C16]">
      {/* 1. Living Photosynthetic Particle Fluid Simulation Canvas (Option 2) */}
      <ParticleFluidCanvas />

      {/* 2. Cinematic Multi-Spectral Atmospheric Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Radial Center Depth */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(16,42,32,0.45)_0%,rgba(7,28,22,0.18)_55%,transparent_100%)] blur-[130px]" />


        {/* Volumetric Spectral Chromatic Bloom (Cyan -> Lime -> Amber -> Magenta) */}
        <div
          className="absolute top-[18%] right-[-5%] w-[700px] h-[420px] rounded-full opacity-60 pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse at 50% 50%,
                rgba(0, 240, 255, 0.22) 0%,
                rgba(183, 243, 107, 0.28) 32%,
                rgba(255, 170, 34, 0.2) 60%,
                rgba(255, 40, 100, 0.12) 80%,
                transparent 100%
              )
            `,
            filter: "blur(90px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Left Incident White Glow Accent */}
        <div className="absolute top-[28%] left-[10%] w-[380px] h-[260px] bg-white/[0.04] blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* 3. Hero Centerpiece: High-Contrast Editorial Headline & CTAs */}
      <div className="w-full max-w-5xl mx-auto my-auto flex flex-col items-center text-center space-y-8 z-20 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-mono text-zinc-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-[#B7F36B]" />
            <span>Next-Generation Foliar Diagnosis & Crop Analytics</span>
          </div>

          {/* Crisp, High-Contrast Editorial Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[104px] font-bold tracking-[-0.04em] text-white leading-[0.93] font-display">
            See Beyond <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C8E6C9] to-[#B7F36B]">
              the Leaf.
            </span>
          </h1>

          {/* Clear, Highly Legible Subtitle */}
          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal pt-1">
            Transform agricultural uncertainty into actionable intelligence with AI-powered plant disease detection and predictive crop harvest forecasting.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={onAnalyzeLeaf}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#B7F36B] hover:bg-[#C6F786] text-[#071C16] font-bold text-sm tracking-tight transition-all duration-300 shadow-[0_0_35px_rgba(183,243,107,0.4)] cursor-pointer active:scale-[0.98]"
          >
            <Scan className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Analyze a Leaf Specimen</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </button>

          <button
            onClick={onExploreCoverage}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white font-medium text-sm transition-all duration-300 backdrop-blur-xl cursor-pointer active:scale-[0.98]"
          >
            <span>Explore 26 Crop Taxonomies</span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </motion.div>

        {/* 4. Three Sleek Glassmorphic Capability Cards */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-8 text-left"
        >
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-[#B7F36B]/30 hover:bg-white/[0.05] transition-all duration-300 space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#071C16] border border-[#B7F36B]/30 flex items-center justify-center text-[#B7F36B] group-hover:scale-105 transition-transform">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {f.title}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 5. Authentic Telemetry Statistics Strip */}
      <div className="w-full max-w-7xl mx-auto pt-8 border-t border-white/[0.08] z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                {s.value}
              </div>
              <div className="text-xs font-mono font-medium text-[#B7F36B]">
                {s.label}
              </div>
              <div className="text-[11px] text-zinc-500 font-sans hidden sm:block">
                {s.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
