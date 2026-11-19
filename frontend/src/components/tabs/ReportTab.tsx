"use client";
import React from "react";
import { FileText, Download, AlertTriangle, CheckCircle2, ShieldAlert, Sprout, Info } from "lucide-react";
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
      <div className="card-bento rounded-3xl p-12 text-center flex flex-col items-center justify-center py-28 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-secondary/40 border border-brand-primary/30 flex items-center justify-center text-brand-primary mb-4 shadow-inner">
          <Info className="w-8 h-8 text-brand-tertiary" />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-2">
          📋 Agro-Dossier Standby
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">Integrated Agro-Report Requires Both Readings</h3>
        <p className="text-xs text-brand-muted mt-1.5 max-w-md leading-relaxed">
          Please complete <strong>Disease Diagnosis (Tab 1)</strong> and <strong>Yield Forecast (Tab 2)</strong>. The system will synthesize leaf pathology with harvest projections.
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
    advice = "Foliage is healthy. No yield reduction expected from disease.";
  } else if (diagLabelLower.includes("early") || diagLabelLower.includes("spot")) {
    penaltyPct = 0.20;
    advice = "Moderate lesions detected — estimated 20% yield loss without treatment.";
  } else {
    penaltyPct = 0.50;
    advice = "Severe blight/infection — estimated 50% yield loss. Immediate fungicide recommended.";
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="card-bento rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-1">
            📋 Integrated Agro-Dossier
          </div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="text-brand-primary w-5 h-5" /> Integrated Agro-Pathology & Yield Synthesis
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Synchronizes foliar deep learning pathology with FAO macro harvest modeling
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-tertiary text-brand-neutral font-black text-xs flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-brand-primary/20 flex-shrink-0"
        >
          <Download className="w-4 h-4" /> Download Inspection Report (.txt)
        </button>
      </div>

      {/* Synchronization Alert */}
      {cropMatches ? (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Synchronized Biological Assessment:</span> Both modules evaluate <strong>{selectedCrop}</strong>. Foliar disease severity directly scales the realizable harvest yield.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Crop Mismatch Notice:</span> Tab 1 diagnosed a <strong>{diagCropName}</strong> leaf, while Tab 2 evaluated <strong>{selectedCrop}</strong>. Plant pathogens are host-specific ({diagCropName} pathogens cannot infect {selectedCrop}). No cross-species penalty is applied. Select a matching crop in Tab 2 for synchronized penalty scaling.
          </div>
        </div>
      )}

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Potential Yield */}
        <div className="card-bento rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-muted font-mono">
              Unconstrained Potential Yield
            </span>
            <div className="text-4xl font-black text-white mt-2 font-mono tabular-nums">
              {baselineTonnes} <span className="text-base font-normal text-brand-muted">t/ha</span>
            </div>
            <p className="text-xs text-brand-muted mt-1 font-mono tabular-nums">
              ({baselineHgHa.toLocaleString()} hg/ha)
            </p>
          </div>
          <p className="text-[11px] text-brand-muted mt-4 pt-3 border-t border-white/5">
            Baseline harvest projection under current agro-climatic conditions.
          </p>
        </div>

        {/* Metric 2: Severity Arc Gauge */}
        <div className="card-bento rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <div className="w-full flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-muted font-mono mb-2">
              Pathological Severity Penalty
            </span>
            <div className="py-1">
              <SeverityArcGauge penaltyPct={cropMatches ? penaltyPct * 100 : 0} />
            </div>
            <p className="text-xs text-brand-muted mt-2 font-mono">
              {cropMatches
                ? (penaltyPct > 0 ? `Estimated Loss: ≈ ${lostTonnes} t/ha` : "Healthy foliage — No penalty")
                : "Independent readings (No cross-species penalty)"}
            </p>
          </div>
          <p className="text-[11px] text-brand-muted mt-3 pt-3 border-t border-white/5 w-full text-center">
            Photosynthetic & foliar vascular impairment factor.
          </p>
        </div>

        {/* Metric 3: Net Harvest */}
        <div className="card-bento rounded-3xl p-6 bg-gradient-to-br from-brand-secondary/50 via-brand-surface/90 to-brand-neutral border-brand-primary/50 shadow-2xl shadow-brand-primary/15 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/15 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-tertiary font-mono">
              Realizable Net Harvest
            </span>
            <div className="text-4xl font-black text-white mt-2 font-mono tabular-nums">
              {adjustedTonnes} <span className="text-base font-normal text-brand-primary">t/ha</span>
            </div>
            <p className="text-xs text-brand-muted mt-1 font-mono tabular-nums">
              ({adjustedHgHa.toLocaleString()} hg/ha)
            </p>
          </div>
          <p className="text-[11px] text-brand-muted mt-4 pt-3 border-t border-white/5">
            Estimated net harvest realizing disease stress impact.
          </p>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="card-bento rounded-3xl p-7 space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-tertiary flex items-center gap-2 mb-3">
            <Sprout className="w-4 h-4" /> Section 1: Foliar Pathology Findings
          </h4>
          <div className="p-4 rounded-2xl bg-brand-neutral/60 border border-white/5 flex items-start gap-3.5">
            {diag.is_healthy ? (
              <CheckCircle2 className="w-6 h-6 text-brand-primary mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{diag.class_name}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary tabular-nums">
                  {(diag.probability * 100).toFixed(1)}% Confidence
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                {diag.is_healthy
                  ? "Leaf tissue demonstrates healthy venation and absence of chlorosis or fungal spore bodies."
                  : `Visual diagnosis identified ${diag.disease}. Grad-CAM heatmaps highlight focal activation on necrotic lesion areas.`}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-tertiary flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4" /> Section 2: Agronomic Guidance & Intervention
          </h4>
          <div className="p-4 rounded-2xl bg-brand-neutral/60 border border-white/5 text-xs leading-relaxed text-gray-300">
            <p className="font-bold text-white mb-1 font-mono text-[11px] uppercase tracking-wider">Recommended Field Action:</p>
            <p className="text-brand-muted">{advice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
