"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/config/api";
import { Header } from "@/components/Header";
import { BioPrismHero } from "@/components/hero/BioPrismHero";
import { CropCoverageSection } from "@/components/crops/CropCoverageSection";
import { DiagnosisTab } from "@/components/tabs/DiagnosisTab";
import { YieldTab } from "@/components/tabs/YieldTab";
import { ReportTab } from "@/components/tabs/ReportTab";
import { MetricsTab } from "@/components/tabs/MetricsTab";
import { Footer } from "@/components/Footer";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

export default function Home() {
  const [activeTab, setActiveTab] = useState("diagnose");
  const [apiConnected, setApiConnected] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [yieldData, setYieldData] = useState<any>(null);
  const [preselectedCrop, setPreselectedCrop] = useState<string | null>(null);

  const workbenchRef = useRef<HTMLDivElement>(null);

  const scrollToWorkbench = (tabName: string) => {
    setActiveTab(tabName);
    workbenchRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCoverage = () => {
    document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth" });
  };

  // Periodically probe FastAPI backend
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
    <SmoothScrollProvider>
      <main className="min-h-screen bg-[#000000] text-[#F3F5EC] flex flex-col font-sans selection:bg-[#B7F36B] selection:text-[#071C16]">
        {/* 1. Minimal Sticky Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={(t) => {
            setActiveTab(t);
            workbenchRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          apiConnected={apiConnected}
          hasDiagnosis={!!diagnosisData}
          hasYield={!!yieldData}
        />

        {/* 2. Signature Cinematic Prism Hero (Awwwards / Next.js Conf Style) */}
        <BioPrismHero
          onAnalyzeLeaf={() => scrollToWorkbench("diagnose")}
          onExploreCoverage={scrollToCoverage}
          onViewMetrics={() => scrollToWorkbench("metrics")}
        />

        {/* 3. Filterable Crop Coverage Taxonomy */}
        <CropCoverageSection />

        {/* 4. Signature Workstation Area */}
        <div
          ref={workbenchRef}
          id="workbench"
          className="border-t border-white/[0.07] bg-[#020705] py-16 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
            {activeTab === "diagnose" && (
              <DiagnosisTab
                onDiagnosisComplete={(d) => {
                  setDiagnosisData(d);
                  // Map diagnosed crop name -> FAO crop name for Yield Forecaster
                  const CROP_TO_FAO: Record<string, string | null> = {
                    Apple: "Apples",
                    Banana: "Bananas",
                    Blueberry: "Blueberries",
                    Cherry: "Cherries",
                    Corn: "Maize (corn)",
                    "Corn (Maize)": "Maize (corn)",
                    Cucumber: "Cucumbers and gherkins",
                    Grape: "Grapes",
                    Mango: "Mangoes, guavas and mangosteens",
                    Orange: "Oranges",
                    Peach: "Peaches and nectarines",
                    "Pepper (Bell)": "Chillies and peppers, green (Capsicum spp. and Pimenta spp.)",
                    Potato: "Potatoes",
                    Raspberry: "Raspberries",
                    Rice: "Rice",
                    Soybean: null,
                    Squash: "Pumpkins, squash and gourds",
                    Strawberry: "Strawberries",
                    Tomato: "Tomatoes",
                    Watermelon: "Watermelons",
                    Wheat: "Wheat",
                  };
                  const detectedCrop = d?.top_prediction?.crop;
                  const faoCrop = detectedCrop ? CROP_TO_FAO[detectedCrop] ?? null : null;
                  setPreselectedCrop(faoCrop);
                }}
                onGoToForecaster={() => scrollToWorkbench("forecast")}
              />
            )}

            {activeTab === "forecast" && (
              <YieldTab onYieldComplete={(y) => setYieldData(y)} preselectedCrop={preselectedCrop} />
            )}

            {activeTab === "report" && (
              <ReportTab diagnosisData={diagnosisData} yieldData={yieldData} />
            )}

            {activeTab === "metrics" && <MetricsTab />}
          </div>
        </div>

        {/* 5. Minimalist Footer */}
        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}
