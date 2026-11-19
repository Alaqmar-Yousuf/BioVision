"use client";

import React from "react";
import { FileText, Download, AlertTriangle, CheckCircle2, ShieldAlert, Sprout, Info, Printer, Layers } from "lucide-react";
import { SeverityArcGauge } from "../RadialGauge";

interface ReportTabProps {
  diagnosisData: any;
  yieldData: any;
}

export const ReportTab: React.FC<ReportTabProps> = ({ diagnosisData, yieldData }) => {
  const hasDiagnosis = !!diagnosisData?.top_prediction;
  const hasYield = !!yieldData?.inputs;

  if (!hasDiagnosis || !hasYield) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-[#070D09]/80 backdrop-blur-2xl p-12 text-center flex flex-col items-center justify-center py-28 shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#A3E635]">
          <Info className="w-6 h-6 text-[#A3E635]" />
        </div>
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
          Synthesized Dossier Standby
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight font-display">
          Complete Both Diagnostic & Yield Steps
        </h3>
        <p className="text-xs text-zinc-400 max-w-md leading-relaxed font-mono">
          Run foliar pathology diagnosis in Tab 01 and compute harvest projections in Tab 02 to generate a synchronized agronomic intelligence report.
        </p>
      </div>
    );
  }

  const diag = diagnosisData.top_prediction;
  const diagRaw = diag.raw_name || "";
  const diagLabelLower = diagRaw.toLowerCase();
  const selectedCrop = yieldData.inputs.Item || "Unknown Crop";
  const matchedExpectedCrop = diagnosisData.matched_fao_crop;
  const diagCropName = diag.crop || "Unknown";

  const cropMatches = matchedExpectedCrop && matchedExpectedCrop === selectedCrop;

  const baselineHgHa = yieldData.predicted_yield_hg_ha;
  const baselineTonnes = yieldData.predicted_yield_tonnes_ha;

  let penaltyPct = 0;
  let advice = "";

  if (diag.is_healthy) {
    penaltyPct = 0.0;
    advice = "Foliage is healthy. No yield reduction expected from foliar pathology.";
  } else if (diagLabelLower.includes("early") || diagLabelLower.includes("spot")) {
    penaltyPct = 0.20;
    advice = "Moderate foliar lesions detected — estimated 20% yield loss without intervention.";
  } else {
    penaltyPct = 0.50;
    advice = "Severe blight or systemic infection detected — estimated 50% yield reduction. Immediate fungicide protocol advised.";
  }

  const adjustedHgHa = cropMatches ? Math.round(baselineHgHa * (1.0 - penaltyPct)) : baselineHgHa;
  const adjustedTonnes = cropMatches ? Number((adjustedHgHa / 10000.0).toFixed(2)) : baselineTonnes;
  const lostTonnes = Number((baselineTonnes - adjustedTonnes).toFixed(2));

  const reportLines = cropMatches ? [
    "==================================================",
    "      BIOVISION SYNCHRONIZED CROP REPORT          ",
    "==================================================",
    `Crop Evaluated:       ${selectedCrop} (Matched Host)`,
    `Foliar Diagnosis:     ${diag.class_name}`,
    `Confidence:           ${(diag.probability * 100).toFixed(2)}%`,
    `Health Status:        ${diag.is_healthy ? "Healthy Foliage" : "Active Pathology"}`,
    "--------------------------------------------------",
    `Potential Yield:      ${baselineHgHa.toLocaleString()} hg/ha (≈ ${baselineTonnes} t/ha)`,
    `Pathology Penalty:    ${(penaltyPct * 100).toFixed(1)}%`,
    `Net Adjusted Yield:   ${adjustedHgHa.toLocaleString()} hg/ha (≈ ${adjustedTonnes} t/ha)`,
    "--------------------------------------------------",
    `Field Conditions:     ${JSON.stringify(yieldData.inputs, null, 2)}`,
    `Agronomic Guidance:   ${advice}`,
    "=================================================="
  ] : [
    "==================================================",
    "      BIOVISION INDEPENDENT FIELD REPORT          ",
    "==================================================",
    `Diagnosed Leaf:       ${diag.class_name} (${(diag.probability * 100).toFixed(2)}%)`,
    `Forecasted Crop:      ${selectedCrop}`,
    `Notice:               Crop mismatch (${diagCropName} vs ${selectedCrop}). No host penalty applied.`,
    `Yield Forecast:       ${baselineHgHa.toLocaleString()} hg/ha (≈ ${baselineTonnes} t/ha)`,
    `Field Conditions:     ${JSON.stringify(yieldData.inputs, null, 2)}`,
    "=================================================="
  ];

  const handleDownloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([reportLines.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "biovision_agro_report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.07] print:hidden">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#A3E635]">
            Synthesized Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Comprehensive Field Dossier
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-full border border-white/10 hover:border-white/30 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-full bg-[#A3E635] text-black font-semibold text-xs font-mono flex items-center gap-1.5 hover:bg-[#bef264] transition-all cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>

      {/* Main Official Dossier Sheet */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#070D09]/80 backdrop-blur-2xl p-6 sm:p-10 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7F36B]/80">
              OFFICIAL CERTIFICATE &bull; BIOVISION RESEARCH PLATFORM
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight font-display">
              BioVision Multimodal Diagnostic Assessment
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Evaluated on {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
            <span>{cropMatches ? "Synchronized Host Profile" : "Independent Profiles"}</span>
          </div>
        </div>

        {/* 2-Column Assessment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diagnostic Assessment Column */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A3E635]">
              Pathological Assessment
            </div>
            <div>
              <div className="text-lg font-bold text-white">{diag.class_name}</div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Model Confidence: <span className="text-white font-bold">{(diag.probability * 100).toFixed(1)}%</span>
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {diag.is_healthy ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Foliage
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Active Pathology Detected
                </span>
              )}
            </div>
          </div>

          {/* Harvest Yield Column */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4]">
              Harvest Yield Projection
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-white">
                {adjustedTonnes} <span className="text-base font-normal text-zinc-400">t/ha</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                ({adjustedHgHa.toLocaleString()} hg/ha net projected)
              </p>
            </div>
            {cropMatches && penaltyPct > 0 && (
              <div className="text-xs font-mono text-amber-400 pt-1">
                Yield penalty applied: -{(penaltyPct * 100).toFixed(0)}% ({lostTonnes} t/ha deficit)
              </div>
            )}
          </div>
        </div>

        {/* Agronomic Action Plan */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Agronomic Action Guidance
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-mono">
            {advice}
          </p>
        </div>
      </div>
    </div>
  );
};
