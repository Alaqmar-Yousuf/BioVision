"use client";
import React from "react";
import { Sprout, Activity, BarChart3, FileText, Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  apiConnected: boolean;
  hasDiagnosis?: boolean;
  hasYield?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  apiConnected,
  hasDiagnosis = false,
  hasYield = false,
}) => {
  const tabs = [
    { id: "diagnose", step: "1", label: "Diagnosis", icon: Activity, isDone: hasDiagnosis },
    { id: "forecast", step: "2", label: "Forecast", icon: BarChart3, isDone: hasYield },
    { id: "report", step: "3", label: "Report", icon: FileText, isDone: hasDiagnosis && hasYield },
    { id: "metrics", step: "4", label: "Metrics", icon: Cpu, isDone: false },
  ];

  return (
    <header className="border-b border-white/5 bg-[#080D0B]/85 backdrop-blur-2xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-secondary via-brand-secondary/90 to-brand-neutral border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-[0_0_25px_rgba(16,185,129,0.25)]">
            <Sprout className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                BioVision
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-bold">
                Next.js 15
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium ${
                apiConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                {apiConnected ? "ML Engine Online" : "FastAPI Standby"}
              </span>
            </div>
            <p className="text-[11px] text-brand-muted tracking-wide mt-0.5">
              Multimodal Plant Pathology & Agro-Yield Engine
            </p>
          </div>
        </div>

        {/* Floating Island Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0D1511]/90 p-1.5 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_25px_-5px_rgba(0,0,0,0.5)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative ${
                  active
                    ? "bg-gradient-to-r from-brand-primary to-brand-tertiary text-brand-neutral shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Step number badge */}
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-black ${
                  active
                    ? "bg-brand-neutral text-brand-primary"
                    : "bg-white/5 text-brand-muted border border-white/10"
                }`}>
                  {tab.step}
                </span>

                <Icon className={`w-3.5 h-3.5 ${active ? "text-brand-neutral" : "text-brand-tertiary"}`} />
                <span>{tab.label}</span>

                {/* Completion indicator dot */}
                {tab.isDone && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-tertiary animate-pulse shadow-[0_0_8px_#2DD4BF]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
