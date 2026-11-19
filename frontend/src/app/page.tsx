"use client";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { Header } from "@/components/Header";
import { DiagnosisTab } from "@/components/tabs/DiagnosisTab";
import { YieldTab } from "@/components/tabs/YieldTab";
import { ReportTab } from "@/components/tabs/ReportTab";
import { MetricsTab } from "@/components/tabs/MetricsTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("diagnose");
  const [apiConnected, setApiConnected] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [yieldData, setYieldData] = useState<any>(null);

  // Probe FastAPI backend periodically
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
        if (res.ok) {
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }
      } catch {
        setApiConnected(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#080D0B] text-gray-100 flex flex-col font-sans selection:bg-brand-primary selection:text-brand-neutral bg-grid-dots">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConnected={apiConnected}
        hasDiagnosis={!!diagnosisData}
        hasYield={!!yieldData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {activeTab === "diagnose" && (
          <DiagnosisTab onDiagnosisComplete={(d) => setDiagnosisData(d)} />
        )}
        {activeTab === "forecast" && (
          <YieldTab onYieldComplete={(y) => setYieldData(y)} />
        )}
        {activeTab === "report" && (
          <ReportTab
            diagnosisData={diagnosisData}
            yieldData={yieldData}
          />
        )}
        {activeTab === "metrics" && <MetricsTab />}
      </div>

      <footer className="border-t border-brand-border/70 py-6 text-center text-xs text-brand-muted bg-brand-neutral/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">BioVision Multimodal Agro-AI Engine • Built with Next.js 15 & FastAPI</p>
          <p className="text-[11px] font-mono text-brand-tertiary">SE-314L Artificial Intelligence • 62 Classes • 26 Crops</p>
        </div>
      </footer>
    </main>
  );
}
