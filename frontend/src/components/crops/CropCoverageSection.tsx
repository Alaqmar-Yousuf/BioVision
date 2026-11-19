"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface CropInfo {
  name: string;
  status: "active" | "roadmap";
  classesCount?: number;
  category: "Fruit" | "Grain" | "Vegetable";
}

const ALL_CROPS: CropInfo[] = [
  { name: "Apple", status: "active", classesCount: 4, category: "Fruit" },
  { name: "Banana", status: "active", classesCount: 4, category: "Fruit" },
  { name: "Blueberry", status: "active", classesCount: 1, category: "Fruit" },
  { name: "Cherry", status: "active", classesCount: 2, category: "Fruit" },
  { name: "Corn (Maize)", status: "active", classesCount: 4, category: "Grain" },
  { name: "Cucumber", status: "active", classesCount: 2, category: "Vegetable" },
  { name: "Grape", status: "active", classesCount: 4, category: "Fruit" },
  { name: "Mango", status: "active", classesCount: 8, category: "Fruit" },
  { name: "Orange", status: "active", classesCount: 1, category: "Fruit" },
  { name: "Peach", status: "active", classesCount: 2, category: "Fruit" },
  { name: "Pepper (Bell)", status: "active", classesCount: 2, category: "Vegetable" },
  { name: "Potato", status: "active", classesCount: 3, category: "Vegetable" },
  { name: "Raspberry", status: "active", classesCount: 1, category: "Fruit" },
  { name: "Rice", status: "active", classesCount: 3, category: "Grain" },
  { name: "Soybean", status: "active", classesCount: 1, category: "Grain" },
  { name: "Squash", status: "active", classesCount: 1, category: "Vegetable" },
  { name: "Strawberry", status: "active", classesCount: 2, category: "Fruit" },
  { name: "Tomato", status: "active", classesCount: 10, category: "Vegetable" },
  { name: "Watermelon", status: "active", classesCount: 4, category: "Fruit" },
  { name: "Wheat", status: "active", classesCount: 3, category: "Grain" },
  // Upcoming vision roadmap (active in yield)
  { name: "Barley", status: "roadmap", category: "Grain" },
  { name: "Carrots & Turnips", status: "roadmap", category: "Vegetable" },
  { name: "Dates", status: "roadmap", category: "Fruit" },
  { name: "Papayas", status: "roadmap", category: "Fruit" },
  { name: "Pears", status: "roadmap", category: "Fruit" },
  { name: "Pineapples", status: "roadmap", category: "Fruit" },
  { name: "Spinach", status: "roadmap", category: "Vegetable" },
];

export function CropCoverageSection() {
  const [filter, setFilter] = useState<"all" | "active" | "roadmap">("all");
  const [search, setSearch] = useState("");

  const filteredCrops = ALL_CROPS.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="coverage" className="max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#C8E6C9]/[0.08] space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#B7F36B]">
            Taxonomic Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F3F5EC] font-display">
            Crop Coverage & Expansion Roadmap
          </h2>
          <p className="text-sm text-[#829B87] max-w-xl leading-relaxed">
            20 botanical species supported for foliar pathology classification, with 7 upcoming additions active in FAO yield benchmarks.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#829B87] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter 26 crops..."
              className="pl-9 pr-4 py-2 rounded-full bg-[#102A20]/80 border border-[#C8E6C9]/15 text-xs text-[#F3F5EC] placeholder-[#829B87] focus:outline-none focus:border-[#B7F36B] w-full sm:w-48 transition-colors font-mono"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#102A20]/70 border border-[#C8E6C9]/10">
            {(["all", "active", "roadmap"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  filter === tab
                    ? "bg-[#B7F36B] text-[#071C16] font-bold shadow-sm"
                    : "text-[#829B87] hover:text-[#F3F5EC]"
                }`}
              >
                {tab === "all" ? "All (26)" : tab === "active" ? "Vision Active (20)" : "Roadmap (7)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Species Cards */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <AnimatePresence>
          {filteredCrops.map((crop) => (
            <motion.div
              key={crop.name}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                crop.status === "active"
                  ? "bg-[#102A20]/60 border-[#C8E6C9]/10 hover:border-[#B7F36B]/40 hover:bg-[#102A20]"
                  : "bg-[#102A20]/25 border-white/[0.04] hover:border-amber-400/30 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#829B87]">
                  {crop.category}
                </span>
                {crop.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/20">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-2.5 h-2.5" /> Yield Only
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-semibold text-[#F3F5EC] tracking-tight">
                  {crop.name}
                </h3>
                <p className="text-[11px] font-mono text-[#829B87] mt-0.5">
                  {crop.classesCount ? `${crop.classesCount} Pathology Classes` : "Vision in expansion"}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
