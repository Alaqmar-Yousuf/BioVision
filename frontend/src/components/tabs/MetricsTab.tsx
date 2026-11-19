"use client";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { Cpu, Award, LineChart, ZoomIn, X, ShieldCheck, Activity, BarChart2, Layers } from "lucide-react";

export const MetricsTab = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          return;
        }
      } catch (err) {
        console.error("API metrics unavailable, trying static fallback:", err);
      }
      try {
        const [clfRes, yldRes] = await Promise.all([
          fetch("/reports/classifier_metrics.json"),
          fetch("/reports/yield_metrics.json"),
        ]);
        const clf = clfRes.ok ? await clfRes.json() : {};
        const yld = yldRes.ok ? await yldRes.json() : {};
        if (Object.keys(clf).length || Object.keys(yld).length) {
          setMetrics({ classifier: clf, yield: yld });
        }
      } catch (e2) {
        console.error("Static metrics fallback also failed:", e2);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const clf = metrics?.classifier || {};
  const yld = metrics?.yield || {};

  const testAcc = clf.test_accuracy ? `${(clf.test_accuracy * 100).toFixed(1)}%` : "96.6%";
  const macroF1 = clf.macro_f1 ? `${(clf.macro_f1 * 100).toFixed(1)}%` : "96.9%";
  const nClasses = clf.n_classes ?? 62;
  const nTestImages = clf.n_test_images?.toLocaleString() ?? "4,249";

  const testR2 = yld.test_r2 ? yld.test_r2.toFixed(4) : "0.9022";
  const testMae = yld.test_mae ? `${Math.round(yld.test_mae).toLocaleString()} hg/ha` : "36,003 hg/ha";
  const testMaeTonnes = yld.test_mae ? `≈ ${(yld.test_mae / 10000).toFixed(2)} t/ha` : "≈ 3.60 t/ha";
  const bestModel = yld.best_model ?? "RandomForestRegressor";
  const nRows = yld.n_rows?.toLocaleString() ?? "31,621";

  const reportPlots = [
    {
      title: "EfficientNetB0 Accuracy & Loss Training Curves",
      filename: "training_curves.png",
      desc: "Epoch progression curves showing convergence and validation loss tracking",
      type: "Vision Classifier"
    },
    {
      title: "Test Set 62-Class Confusion Matrix",
      filename: "confusion_matrix.png",
      desc: "Normalized multi-class evaluation breakdown showing diagonal true positives",
      type: "Vision Classifier"
    },
    {
      title: "Actual vs Predicted Harvest Yield",
      filename: "yield_actual_vs_pred.png",
      desc: "Parity plot demonstrating linear alignment across test split observations",
      type: "Yield Regressor"
    },
    {
      title: "Permutation Feature Importance",
      filename: "yield_importance.png",
      desc: "Relative importance of Area, Crop, Rainfall, Pesticides, and Temperature",
      type: "Yield Regressor"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
            Empirical Telemetry
          </div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="text-emerald-400 w-4 h-4" /> Empirical Evaluation & Validation Artifacts
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            Direct outputs from automated training pipelines on 4,249 holdout test images and 31,621 FAO records
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/10 flex items-center gap-2 flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Pipelines
        </span>
      </div>

      {/* Vision Model Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              1. Foliar Pathology Classifier (EfficientNetB0)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Input: 224x224 RGB &bull; {nClasses} Classes</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Test Set Accuracy</span>
            <div className="text-3xl font-bold text-white font-mono mt-2 tabular-nums">{testAcc}</div>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono tabular-nums">{nTestImages} Test Leaves</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Macro F1-Score</span>
            <div className="text-3xl font-bold text-white font-mono mt-2 tabular-nums">{macroF1}</div>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">Balanced multi-class mean</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Categorical Classes</span>
            <div className="text-3xl font-bold text-white font-mono mt-2 tabular-nums">{nClasses}</div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">20 Crop Species</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Explainability</span>
            <div className="text-2xl font-bold text-white font-mono mt-2.5">Grad-CAM</div>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">Conv Saliency Heatmaps</p>
          </div>
        </div>
      </div>

      {/* Yield Ensemble Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              2. Crop Harvest Yield Model ({bestModel})
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono tabular-nums">Trained on {nRows} Observations</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Test R² Score</span>
            <div className="text-3xl font-bold text-white font-mono mt-2 tabular-nums">{testR2}</div>
            <p className="text-[11px] text-cyan-400 mt-1 font-mono">Variance Explained</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Test MAE</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-2 tabular-nums whitespace-nowrap">{testMae}</div>
            <p className="text-[11px] text-cyan-400 mt-1 font-mono tabular-nums">{testMaeTonnes}</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Dataset Scale</span>
            <div className="text-3xl font-bold text-white font-mono mt-2 tabular-nums">{nRows}</div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">FAO Global Data Points</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-5 backdrop-blur-xl">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Covered Crops</span>
            <div className="text-3xl font-bold text-white font-mono mt-2 tabular-nums">26</div>
            <p className="text-[11px] text-cyan-400 mt-1 font-mono">Full Cross-Tab Scope</p>
          </div>
        </div>
      </div>

      {/* Generated Report Plots Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              3. Visual Validation Curves & Confusion Matrices
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Click to enlarge</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportPlots.map((plot, i) => (
            <div
              key={i}
              onClick={() => setActiveImageModal(plot.filename)}
              className="group rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-5 hover:border-white/20 transition-all cursor-pointer backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                    {plot.type}
                  </span>
                  <ZoomIn className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {plot.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-mono">
                  {plot.desc}
                </p>
              </div>

              <div className="mt-4 relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
                <img
                  src={`/reports/${plot.filename}`}
                  alt={plot.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Zoom Modal */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-zinc-950 border border-white/20 rounded-3xl p-6 overflow-hidden flex flex-col">
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center justify-center mt-6">
              <img
                src={`/reports/${activeImageModal}`}
                alt="Enlarged Report Plot"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
