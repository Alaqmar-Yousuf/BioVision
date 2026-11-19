"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BarChart3, FileText, Cpu, Sparkles, Menu, X, ArrowUpRight } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  apiConnected: boolean;
  hasDiagnosis?: boolean;
  hasYield?: boolean;
  onExploreCoverage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  apiConnected,
  hasDiagnosis = false,
  hasYield = false,
  onExploreCoverage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "diagnose", label: "Diagnosis", icon: Activity, indicator: hasDiagnosis },
    { id: "forecast", label: "Forecast", icon: BarChart3, indicator: hasYield },
    { id: "report", label: "Reports", icon: FileText, indicator: hasDiagnosis && hasYield },
    { id: "metrics", label: "Metrics", icon: Cpu, indicator: false },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] sm:w-auto max-w-4xl transition-all select-none">
      {/* Floating Capsule Island */}
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-3 p-1.5 sm:p-2 rounded-full bg-black/75 border border-white/[0.12] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] hover:border-white/20 transition-all duration-300">
        
        {/* Brand Wordmark & Animated Dot */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer group"
          title="Scroll to Top"
        >
          <span className="w-2 h-2 rounded-full bg-[#B7F36B] shadow-[0_0_10px_#B7F36B] group-hover:scale-125 transition-transform" />
          <span className="text-sm font-bold tracking-tight text-white font-display">
            BioVision
          </span>
        </button>

        {/* Vertical Hairline Divider */}
        <div className="hidden sm:block w-[1px] h-4 bg-white/10" />

        {/* Center Desktop Segmented Navigation Pills */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none ${
                  active ? "text-[#071C16] font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="floatingNavPill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[#B7F36B] shadow-[0_0_20px_rgba(183,243,107,0.35)]"
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-[#071C16]" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                  {item.indicator && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? "bg-[#071C16]" : "bg-[#B7F36B] shadow-[0_0_8px_#B7F36B]"
                      }`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Vertical Hairline Divider */}
        <div className="hidden md:block w-[1px] h-4 bg-white/10" />

        {/* Right Status Beacon & Quick CTA */}
        <div className="hidden md:flex items-center gap-2 pl-1 pr-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] text-[11px] font-mono text-zinc-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiConnected ? "bg-[#B7F36B] animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{apiConnected ? "AI Online" : "Standby"}</span>
          </div>

          <button
            onClick={() => handleNavClick("diagnose")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B7F36B] hover:bg-[#C6F786] text-[#071C16] text-xs font-bold transition-all shadow-[0_0_15px_rgba(183,243,107,0.25)] cursor-pointer active:scale-95"
          >
            <span>Analyze</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#071C16]" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2 pr-1">
          <button
            onClick={() => handleNavClick("diagnose")}
            className="px-2.5 py-1 rounded-full bg-[#B7F36B] text-[#071C16] text-[11px] font-bold"
          >
            Analyze
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-full bg-white/[0.08] text-white hover:bg-white/[0.14] transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Dropdown Menu Card */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="sm:hidden mt-2 p-3 rounded-3xl bg-black/90 border border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-1.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[#B7F36B] text-[#071C16] font-semibold"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.indicator && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7F36B]" />
                  )}
                </button>
              );
            })}

            <div className="pt-2 mt-1 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-500 px-2">
              <span>Status: {apiConnected ? "Online" : "Standby"}</span>
              <span className="text-[#B7F36B]">96.6% Accuracy</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
