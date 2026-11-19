"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/config/api";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  TrendingUp,
  Sliders,
  X,
  AlertCircle
} from "lucide-react";
import { CircularConfidenceGauge } from "../RadialGauge";
import { ImageComparisonSlider } from "../ImageComparisonSlider";

interface DiagnosisTabProps {
  onDiagnosisComplete?: (diagnosis: any) => void;
  onGoToForecaster?: () => void;
}

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({
  onDiagnosisComplete,
  onGoToForecaster,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Grad-CAM mode: "slider" (split) or "blend" (opacity slider)
  const [viewMode, setViewMode] = useState<"slider" | "blend">("slider");
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, or WEBP).");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const handleDiagnose = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/diagnose`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Inference service error (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
      if (onDiagnosisComplete) {
        onDiagnosisComplete(data);
      }
    } catch (err: any) {
      setError(
        err.message || "Unable to reach the BioVision FastAPI backend. Ensure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Workstation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#C8E6C9]/[0.08]">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#B7F36B]">
            Vision Pathology Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5EC] font-display">
            Foliar Pathology & Saliency Inspection
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#829B87]">
          <span className="w-2 h-2 rounded-full bg-[#B7F36B]" />
          <span>EfficientNetB0 (62 Classes)</span>
        </div>
      </div>

      {/* Main Dual-Column Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Specimen Ingestion & Laser Scanner */}
        <div className="rounded-3xl border border-[#C8E6C9]/[0.08] bg-[#102A20]/70 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(3,10,8,0.6)]">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#C8E6C9]/[0.06]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#829B87]">
                01. Specimen Ingestion
              </span>
              {preview && (
                <button
                  onClick={handleReset}
                  className="text-xs font-mono text-[#829B87] hover:text-[#F3F5EC] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dropzone / Viewport */}
            {!preview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                className={`relative border-2 border-dashed rounded-2xl p-8 min-h-[380px] cursor-pointer transition-all flex flex-col items-center justify-center text-center group overflow-hidden ${
                  isDragOver
                    ? "border-[#B7F36B] bg-[#B7F36B]/[0.08] shadow-[0_0_40px_rgba(183,243,107,0.25)]"
                    : "border-[#C8E6C9]/15 hover:border-[#B7F36B]/40 bg-[#071C16]/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                <div className="w-16 h-16 rounded-2xl bg-[#102A20] border border-[#C8E6C9]/15 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-[#B7F36B]/40 transition-all">
                  <UploadCloud className="w-6 h-6 text-[#829B87] group-hover:text-[#B7F36B] transition-colors" />
                </div>

                <p className="text-base font-semibold text-[#F3F5EC] tracking-tight">
                  Drag and drop foliar leaf photo
                </p>
                <p className="text-xs text-[#829B87] mt-1.5 max-w-xs leading-relaxed font-mono">
                  Upload a clear single-leaf specimen of any supported crop (Apple, Tomato, Corn, Potato, Rice, etc.)
                </p>

                <div className="mt-6 flex items-center gap-2 font-mono text-[10px] text-[#829B87]">
                  <span className="px-2.5 py-1 rounded-full bg-[#102A20] border border-[#C8E6C9]/10">
                    JPG &bull; PNG &bull; WEBP
                  </span>
                  <span>&bull;</span>
                  <span>Auto-scaled to 224&times;224 RGB</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[380px] space-y-4">
                {/* Image Container with Laser Scan Animation when loading */}
                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-[#C8E6C9]/15 bg-black shadow-2xl">
                  {/* Laser Scanning Line Animation */}
                  {loading && <div className="animate-bioscan" />}

                  {result?.gradcam_image && viewMode === "slider" ? (
                    <ImageComparisonSlider
                      originalImage={preview}
                      gradcamImage={result.gradcam_image}
                    />
                  ) : result?.gradcam_image && viewMode === "blend" ? (
                    <div className="relative w-full h-full">
                      <img src={preview} alt="Base specimen" className="w-full h-full object-cover" />
                      <img
                        src={result.gradcam_image}
                        alt="Heatmap overlay"
                        className="absolute inset-0 w-full h-full object-cover transition-opacity"
                        style={{ opacity: heatmapOpacity }}
                      />
                    </div>
                  ) : (
                    <img src={preview} alt="Leaf Preview" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Saliency View Controls if Grad-CAM is ready */}
                {result?.gradcam_image && (
                  <div className="w-full max-w-[340px] space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#829B87] flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#B7F36B]" /> Saliency View Mode
                      </span>
                      <div className="flex items-center gap-1 bg-[#071C16] p-1 rounded-lg border border-[#C8E6C9]/15">
                        <button
                          onClick={() => setViewMode("slider")}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            viewMode === "slider" ? "bg-[#B7F36B] text-[#071C16] font-bold" : "text-[#829B87]"
                          }`}
                        >
                          Split
                        </button>
                        <button
                          onClick={() => setViewMode("blend")}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            viewMode === "blend" ? "bg-[#B7F36B] text-[#071C16] font-bold" : "text-[#829B87]"
                          }`}
                        >
                          Blend
                        </button>
                      </div>
                    </div>

                    {viewMode === "blend" && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-[#829B87] whitespace-nowrap">Heatmap Blend</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={heatmapOpacity}
                          onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-[10px] font-mono text-[#F3F5EC] w-8 tabular-nums">
                          {Math.round(heatmapOpacity * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Fallback Notice */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          {preview && !result && (
            <button
              onClick={handleDiagnose}
              disabled={loading}
              className="mt-6 w-full py-4 rounded-full bg-[#B7F36B] hover:bg-[#C6F786] text-[#071C16] font-bold text-sm tracking-tight transition-all duration-300 hover:shadow-[0_0_35px_rgba(183,243,107,0.4)] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Foliar Saliency & Pathology...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Neural Diagnosis & Grad-CAM</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: Pathological Diagnostic Telemetry */}
        <div className="rounded-3xl border border-[#C8E6C9]/[0.08] bg-[#102A20]/70 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(3,10,8,0.6)]">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#C8E6C9]/[0.06]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#829B87]">
                02. Diagnostic Telemetry
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#071C16] text-[#C8E6C9] border border-[#C8E6C9]/15">
                Top-3 Distribution
              </span>
            </div>

            {/* Empty State */}
            {!result ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#071C16] border border-[#C8E6C9]/10 flex items-center justify-center text-[#829B87]">
                  <Layers className="w-6 h-6 text-[#829B87]" />
                </div>
                <div className="text-sm font-semibold text-[#F3F5EC]">Awaiting specimen acquisition</div>
                <p className="text-xs text-[#829B87] max-w-xs leading-relaxed font-mono">
                  Drop a leaf photo on the left to activate neural probability calculations and Grad-CAM saliency heatmaps.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Prediction Banner */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    result.top_prediction.is_healthy
                      ? "bg-[#071C16]/80 border-[#B7F36B]/30 shadow-[0_0_30px_rgba(183,243,107,0.1)]"
                      : "bg-[#181308]/80 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <CircularConfidenceGauge
                      percentage={result.top_prediction.probability * 100}
                      size={86}
                      strokeWidth={6}
                      label="Confidence"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#829B87] mb-1">
                        Primary Neural Identification
                      </div>
                      <h3 className="text-lg font-bold text-[#F3F5EC] tracking-tight leading-snug">
                        {result.top_prediction.class_name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {result.top_prediction.is_healthy ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/30 font-medium flex items-center gap-1.5 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Foliage
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium flex items-center gap-1.5 font-mono">
                            <AlertTriangle className="w-3.5 h-3.5" /> Active Pathology
                          </span>
                        )}
                        <span className="text-xs font-mono text-[#829B87]">
                          Host Crop: <strong className="text-[#F3F5EC]">{result.top_prediction.crop}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top-3 Probability Distribution */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#829B87]">
                    Confidence Distribution
                  </div>
                  <div className="space-y-2">
                    {result.top_3.map((pred: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-[#071C16]/60 border border-[#C8E6C9]/10 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#F3F5EC] font-medium">{pred.class_name}</span>
                          <span className="text-[#B7F36B] font-mono font-bold tabular-nums">
                            {(pred.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#102A20] h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(pred.probability * 100, 2)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-gradient-to-r from-[#C8E6C9] to-[#B7F36B] h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agronomic Guidance */}
                {result.advisory && (
                  <div className="p-4 rounded-xl bg-[#071C16]/60 border border-[#C8E6C9]/10 text-xs space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#B7F36B] font-semibold">
                      Agronomic Guidance
                    </div>
                    <div className="font-semibold text-[#F3F5EC]">{result.advisory.severity}</div>
                    <p className="text-[#829B87] leading-relaxed font-mono text-[11px]">
                      {result.advisory.treatment}
                    </p>
                  </div>
                )}

                {/* Cross-Tab Auto-Action */}
                {onGoToForecaster && (
                  <button
                    onClick={onGoToForecaster}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-[#C8E6C9]/15 bg-[#102A20]/80 hover:bg-[#102A20] text-[#F3F5EC] font-mono text-xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <TrendingUp className="w-4 h-4 text-[#B7F36B]" />
                    Forecast harvest yield for <strong className="text-[#B7F36B]">{result.top_prediction.crop}</strong> &rarr;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
