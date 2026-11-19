"use client";

import React from "react";
import { Sparkles, ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-white/[0.07] bg-[#030705] py-12 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A3E635]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-300">BioVision Multimodal Agro-AI Engine</span>
            <span className="mx-2 text-zinc-700">&bull;</span>
            <span>Autonomous Agricultural Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span>62 Classes</span>
          <span className="text-zinc-700">&bull;</span>
          <span>20 Vision Crops</span>
          <span className="text-zinc-700">&bull;</span>
          <span>26 Yield Benchmarks</span>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-full border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Scroll to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
