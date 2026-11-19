"use client";
import React, { useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { UploadCloud, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Info, Clock, ChevronDown, ChevronUp, Scan } from "lucide-react";
import { ImageComparisonSlider } from "../ImageComparisonSlider";
import { CircularConfidenceGauge } from "../RadialGauge";

interface DiagnosisTabProps {
  onDiagnosisComplete?: (diagnosis: any) => void;
}

const ACTIVE_VISION_CROPS = [
  { name: "Apple", icon: "🍏" },
  { name: "Banana", icon: "🍌" },
  { name: "Blueberry", icon: "🫐" },
  { name: "Cherry", icon: "🍒" },
  { name: "Corn (Maize)", icon: "🌽" },
  { name: "Cucumber", icon: "🥒" },
  { name: "Grape", icon: "🍇" },
  { name: "Mango", icon: "🥭" },
  { name: "Orange", icon: "🍊" },
  { name: "Peach", icon: "🍑" },
  { name: "Pepper (Bell)", icon: "🫑" },
  { name: "Potato", icon: "🥔" },
  { name: "Raspberry", icon: "🍇" },
  { name: "Rice", icon: "🍚" },
  { name: "Soybean", icon: "🌱" },
  { name: "Squash", icon: "🎃" },
  { name: "Strawberry", icon: "🍓" },
  { name: "Tomato", icon: "🍅" },
  { name: "Watermelon", icon: "🍉" },
  { name: "Wheat", icon: "🌾" }
];

const UPCOMING_VISION_CROPS = [
  { name: "Barley", icon: "🌾", status: "Active in Yield • Vision Next" },
  { name: "Carrots & Turnips", icon: "🥕", status: "Active in Yield • Vision Next" },
  { name: "Dates", icon: "🌴", status: "Active in Yield • Vision Next" },
  { name: "Papayas", icon: "🍈", status: "Active in Yield • Vision Next" },
  { name: "Pears", icon: "🍐", status: "Active in Yield • Vision Next" },
  { name: "Pineapples", icon: "🍍", status: "Active in Yield • Vision Next" },
  { name: "Spinach", icon: "🥬", status: "Active in Yield • Vision Next" }
];

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({ onDiagnosisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showCatalog, setShowCatalog] = useState(false);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const handleDiagnose = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/diagnose`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();
      setResult(data);
      if (onDiagnosisComplete) {
        onDiagnosisComplete(data);
      }
    } catch {
      alert(`Unable to reach the BioVision FastAPI service on ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Species Coverage & Roadmap Banner */}
      <div className="card-bento rounded-3xl p-5 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-secondary/80 border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-inner flex-shrink-0">
              <Info className="w-5 h-5 text-brand-tertiary" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-0.5">
                🔬 Specimen Coverage Matrix
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white tracking-tight">Species Coverage & 26-Crop Expansion Roadmap</h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-semibold">
                  20 Active Vision Crops • 62 Classes
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Current EfficientNetB0 diagnostic coverage & upcoming additions currently active in Yield Forecasting
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="text-xs font-bold text-brand-tertiary hover:text-white px-4 py-2 rounded-xl bg-brand-neutral/80 border border-white/10 hover:border-brand-primary/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm flex-shrink-0"
          >
            {showCatalog ? (
              <>
                <span>Hide Coverage Details</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View All 26 Crops & Roadmap</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Expandable Species Details */}
        {showCatalog && (
          <div className="mt-5 pt-5 border-t border-white/10 space-y-6">
            {/* Section 1: Active Vision Crops */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Active Leaf Pathology Diagnostics ({ACTIVE_VISION_CROPS.length} Crops • 62 Classes)
                </h4>
              </div>
              <p className="text-[11px] text-brand-muted mb-3">
                Upload clear, single-leaf photos of any species below for instant neural classification and Grad-CAM saliency mapping:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {ACTIVE_VISION_CROPS.map((crop, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-xl bg-brand-neutral/70 border border-white/5 flex items-center gap-2 text-xs font-medium text-gray-200 hover:border-brand-primary/40 transition-colors"
                  >
                    <span>{crop.icon}</span>
                    <span>{crop.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Planned Vision Extensions (Active in Tab 2 Yield) */}
            <div className="p-4 rounded-2xl bg-brand-secondary/20 border border-brand-secondary/60">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-brand-tertiary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-tertiary">
                  Planned Vision Extensions ({UPCOMING_VISION_CROPS.length} Crops — Fully Active in Tab 2 Yield Forecasting)
                </h4>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed mb-3">
                These 7 crops are <strong className="text-white">already fully integrated into Tab 2 (Yield Forecasting)</strong> with trained FAO global benchmarks. Foliar pathology image classification will be enabled in the upcoming vision expansion as multi-pathogen foliar datasets are finalized:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {UPCOMING_VISION_CROPS.map((crop, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-brand-neutral/90 border border-white/5 flex items-center justify-between hover:border-brand-tertiary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{crop.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{crop.name}</div>
                        <div className="text-[10px] text-brand-tertiary font-mono">Yield Active • Vision Soon</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Upload & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Card: Acquisition & Preview */}
        <div className="card-bento rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-2">
              🔬 Specimen Acquisition Viewport
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="text-brand-primary w-5 h-5" /> Foliar Image Acquisition
              </h2>
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-brand-neutral text-brand-muted border border-white/10">
                224 x 224 RGB
              </span>
            </div>

            {!preview ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                }}
                className="relative border border-dashed border-brand-primary/30 hover:border-brand-primary/80 rounded-2xl p-8 min-h-[360px] cursor-pointer transition-all bg-brand-neutral/60 flex flex-col items-center justify-center text-center group corner-reticle overflow-hidden"
              >
                {/* Micro laser scanline */}
                <div className="animate-scanline" />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {/* Precision Digital Reticle SVG */}
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full text-brand-primary/40 group-hover:text-brand-primary transition-colors" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                    <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <line x1="50" y1="5" x2="50" y2="25" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="50" y1="75" x2="50" y2="95" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="5" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="75" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="3" fill="#10B981" />
                  </svg>
                  <Scan className="absolute w-7 h-7 text-brand-tertiary group-hover:scale-110 transition-transform" />
                </div>

                <p className="text-sm text-white font-bold tracking-tight">Drop foliar specimen photo here</p>
                <p className="text-xs text-brand-muted mt-1 max-w-xs leading-relaxed">
                  Single-leaf closeup of any of the 20 supported species (Apple, Corn, Potato, Tomato, Rice, Wheat, etc.)
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono tracking-[0.18em] px-3 py-1 rounded-full bg-brand-surface text-brand-muted border border-white/10">
                    JPG • PNG • WEBP
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-[0.18em] px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                    Neural Ready
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[360px]">
                {result?.gradcam_image ? (
                  /* Interactive Split-Screen Comparison Slider */
                  <ImageComparisonSlider
                    originalImage={preview}
                    gradcamImage={result.gradcam_image}
                  />
                ) : (
                  /* Standard Image Preview Before Diagnosis */
                  <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black corner-reticle">
                    <img
                      src={preview}
                      alt="Leaf Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <label className="text-xs text-brand-muted hover:text-white cursor-pointer px-4 py-2 rounded-xl bg-brand-neutral border border-white/10 hover:border-brand-primary/50 transition-all font-mono font-medium">
                    Upload Different Leaf
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {preview && !result && (
            <button
              onClick={handleDiagnose}
              disabled={loading}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-tertiary text-brand-neutral font-black tracking-wide hover:brightness-110 transition-all shadow-[0_0_30px_rgba(16,185,129,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {loading ? "Analyzing Foliar Pathology..." : "Classify Leaf Pathology & Grad-CAM"}
            </button>
          )}
        </div>

        {/* Right Card: Pathology Findings */}
        <div className="card-bento rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-2">
              ⚡ Neural Inference Findings
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="text-brand-tertiary w-5 h-5" /> Pathological Diagnostic Findings
              </h2>
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-brand-neutral text-brand-muted border border-white/10">
                EfficientNetB0
              </span>
            </div>

            {!result ? (
              <div className="py-24 text-center text-brand-muted text-sm flex flex-col items-center justify-center">
                {/* High-tech standby scanner graphic */}
                <div className="relative w-16 h-16 rounded-2xl bg-brand-secondary/40 border border-brand-primary/30 flex items-center justify-center mb-4 text-brand-primary shadow-inner">
                  <div className="w-8 h-8 rounded-full border border-brand-primary/40 border-t-brand-primary animate-spin" />
                </div>
                <p className="font-bold text-white tracking-tight">No leaf specimen analyzed yet</p>
                <p className="text-xs text-brand-muted mt-1.5 max-w-xs leading-relaxed">
                  Upload a photo on the left and run diagnosis to view real neural classification, probability confidence, and Grad-CAM saliency heatmaps.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Prediction Banner with Luminous Aura */}
                <div className="relative">
                  {/* Ambient Glow */}
                  <div className={`absolute -inset-1 rounded-2xl blur-lg pointer-events-none opacity-50 ${
                    result.top_prediction.is_healthy ? "bg-emerald-500/20" : "bg-amber-500/20"
                  }`} />

                  <div className={`relative p-5 rounded-2xl border transition-all ${
                    result.top_prediction.is_healthy
                      ? "bg-brand-secondary/40 border-brand-primary/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                      : "bg-amber-950/30 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Circular Confidence Gauge */}
                      <div className="flex-shrink-0">
                        <CircularConfidenceGauge
                          percentage={result.top_prediction.probability * 100}
                          size={92}
                          strokeWidth={7}
                          label="Confidence"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Pulsing health radar dot */}
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              result.top_prediction.is_healthy ? "bg-emerald-400" : "bg-amber-400"
                            }`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              result.top_prediction.is_healthy ? "bg-emerald-500" : "bg-amber-500"
                            }`}></span>
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">
                            Primary Neural Identification
                          </span>
                        </div>

                        <h3 className="text-base font-black text-white leading-tight">
                          {result.top_prediction.class_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {result.top_prediction.is_healthy ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Foliage
                            </span>
                          ) : (
                            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Active Pathology
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-brand-muted">
                            Crop Host: <strong className="text-gray-200">{result.top_prediction.crop}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top-3 Candidate Distribution */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-brand-muted uppercase tracking-wider mb-3">
                    Top-3 Probability Distribution
                  </h4>
                  <div className="space-y-3">
                    {result.top_3.map((pred: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-brand-neutral/70 border border-white/5 space-y-2 hover:border-brand-primary/30 transition-colors">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-200">{pred.class_name}</span>
                          <span className="text-brand-tertiary font-mono tabular-nums">{(pred.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-brand-neutral h-2.5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-gradient-to-r from-brand-primary to-brand-tertiary h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${Math.max(pred.probability * 100, 3)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advisory Snippet */}
                {result.advisory && (
                  <div className="p-4 rounded-2xl bg-brand-neutral/80 border border-white/10 text-xs space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-tertiary">
                      Agronomic Impact Warning
                    </span>
                    <p className="text-gray-200 font-bold">{result.advisory.severity}</p>
                    <p className="text-brand-muted leading-relaxed">{result.advisory.treatment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
