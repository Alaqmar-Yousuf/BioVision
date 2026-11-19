"use client";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import defaultSchema from "@/config/schema.json";
import { TrendingUp, CloudRain, Thermometer, FlaskConical, Globe, Sprout, BarChart2, ShieldCheck, RefreshCw, Clock, ChevronDown } from "lucide-react";

interface YieldTabProps {
  onYieldComplete?: (yieldData: any) => void;
}

const UPCOMING_VISION_CROPS_NAMES = [
  "Barley", "Carrots and turnips", "Dates", "Papayas", "Pears", "Pineapples", "Spinach"
];

export const YieldTab: React.FC<YieldTabProps> = ({ onYieldComplete }) => {
  const [countries, setCountries] = useState<string[]>(defaultSchema.Area?.options || []);
  const [crops, setCrops] = useState<string[]>(defaultSchema.Item?.options || []);
  const [schemaLimits, setSchemaLimits] = useState<any>({
    rain: defaultSchema.average_rain_fall_mm_per_year,
    pest: defaultSchema.pesticides_tonnes,
    temp: defaultSchema.avg_temp
  });

  const [formData, setFormData] = useState({
    Area: "India",
    Item: "Potatoes",
    average_rain_fall_mm_per_year: 788,
    pesticides_tonnes: 3500,
    avg_temp: 17.8,
  });

  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const [schemaRes, metricsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/schema`),
          fetch(`${API_BASE_URL}/api/metrics`)
        ]);

        if (schemaRes.ok) {
          const s = await schemaRes.json();
          if (s.Area?.options) setCountries(s.Area.options);
          if (s.Item?.options) setCrops(s.Item.options);
          setSchemaLimits({
            rain: s.average_rain_fall_mm_per_year,
            pest: s.pesticides_tonnes,
            temp: s.avg_temp
          });
        }

        if (metricsRes.ok) {
          const m = await metricsRes.json();
          setModelMetrics(m.yield);
        }
      } catch (e) {
        console.error("Failed to load schema from API:", e);
      }
    };
    fetchSchema();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Yield forecast failed");
      const data = await res.json();
      setForecast(data);
      if (onYieldComplete) {
        onYieldComplete({ ...data, inputs: formData });
      }
    } catch {
      alert(`Unable to reach the BioVision FastAPI service on ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const rainMin = schemaLimits?.rain?.min ?? 51;
  const rainMax = schemaLimits?.rain?.max ?? 3240;
  const pestMin = schemaLimits?.pest?.min ?? 1;
  const pestMax = schemaLimits?.pest?.max ?? 350000;
  const tempMin = schemaLimits?.temp?.min ?? 1.5;
  const tempMax = schemaLimits?.temp?.max ?? 32;

  const isUpcoming = UPCOMING_VISION_CROPS_NAMES.includes(formData.Item);

  const rainPct = ((formData.average_rain_fall_mm_per_year - rainMin) / (rainMax - rainMin)) * 100;
  const pestPct = ((formData.pesticides_tonnes - pestMin) / (pestMax - pestMin)) * 100;
  const tempPct = ((formData.avg_temp - tempMin) / (tempMax - tempMin)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Parameter Control Panel (Left 2 cols) */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 card-bento rounded-3xl p-7 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-2">
              🌾 Agro-Climatic Parameters
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-brand-primary w-5 h-5" /> Agro-Climatic Yield Forecasting
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Model: <span className="text-white font-semibold">{modelMetrics?.best_model ?? "RandomForestRegressor"}</span> • Trained on <span className="text-white font-semibold tabular-nums">{modelMetrics?.n_rows?.toLocaleString() ?? "31,621"}</span> FAO records across 26 global crops
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-brand-secondary/80 text-brand-tertiary border border-brand-primary/30 shadow-sm flex items-center gap-1.5 flex-shrink-0 tabular-nums">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> Test R² = {modelMetrics?.test_r2 ? modelMetrics.test_r2.toFixed(4) : "0.9022"}
              </span>
            </div>
          </div>

          {/* Precision Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono font-bold text-brand-muted uppercase flex items-center gap-1.5 mb-2">
                <Globe className="w-3.5 h-3.5 text-brand-primary" /> Country / Region ({countries.length} FAO Countries)
              </label>
              <div className="relative">
                <select
                  value={formData.Area}
                  onChange={(e) => setFormData({ ...formData, Area: e.target.value })}
                  className="w-full bg-brand-neutral/90 border border-white/10 rounded-2xl px-4 py-3 text-white appearance-none focus:border-brand-primary focus:outline-none cursor-pointer transition-all shadow-inner text-sm hover:border-brand-primary/50 font-medium"
                >
                  {countries.length > 0 ? (
                    countries.map((c, i) => <option key={i} value={c}>{c}</option>)
                  ) : (
                    <option value="India">India</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-brand-muted uppercase flex items-center gap-1.5 mb-2">
                <Sprout className="w-3.5 h-3.5 text-brand-primary" /> Target Crop ({crops.length} FAO Crop Types)
              </label>
              <div className="relative">
                <select
                  value={formData.Item}
                  onChange={(e) => setFormData({ ...formData, Item: e.target.value })}
                  className="w-full bg-brand-neutral/90 border border-white/10 rounded-2xl px-4 py-3 text-white appearance-none focus:border-brand-primary focus:outline-none cursor-pointer transition-all shadow-inner text-sm hover:border-brand-primary/50 font-medium"
                >
                  {crops.length > 0 ? (
                    crops.map((cr, i) => <option key={i} value={cr}>{cr}</option>)
                  ) : (
                    <option value="Potatoes">Potatoes</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              </div>
              {isUpcoming && (
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-brand-secondary/50 border border-brand-primary/40 flex items-center gap-2 text-[11px] text-brand-tertiary">
                  <Clock className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                  <span>Active in Yield Forecasting • Foliar Vision Diagnosis coming soon</span>
                </div>
              )}
            </div>
          </div>

          {/* Precision Sliders with Tabular Feedback */}
          <div className="space-y-4 pt-1">
            {/* Rainfall */}
            <div className="p-5 rounded-2xl bg-brand-neutral/60 border border-white/5 hover:border-brand-primary/30 transition-all space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted flex items-center gap-1.5 font-bold">
                  <CloudRain className="w-4 h-4 text-brand-tertiary" /> Annual Precipitation (Rainfall)
                </span>
                <span className="text-white font-mono font-bold text-sm bg-brand-secondary/80 px-3 py-0.5 rounded-xl border border-brand-primary/30 shadow-inner tabular-nums">
                  {formData.average_rain_fall_mm_per_year} mm/yr
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={rainMin}
                  max={rainMax}
                  step="10"
                  value={formData.average_rain_fall_mm_per_year}
                  onChange={(e) => setFormData({ ...formData, average_rain_fall_mm_per_year: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-lg cursor-pointer accent-brand-primary"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #2DD4BF ${rainPct}%, #14211A ${rainPct}%, #14211A 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-blue-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span> Arid &lt;300mm
                </span>
                <span className="text-brand-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block"></span> Optimal 700–1200mm
                </span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span> Waterlogging &gt;2500mm
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-brand-muted font-mono tabular-nums">
                <span>Min: {rainMin} mm</span>
                <span>Median: {schemaLimits?.rain?.median ?? 788} mm</span>
                <span>Max: {rainMax} mm</span>
              </div>
            </div>

            {/* Pesticides */}
            <div className="p-5 rounded-2xl bg-brand-neutral/60 border border-white/5 hover:border-brand-primary/30 transition-all space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted flex items-center gap-1.5 font-bold">
                  <FlaskConical className="w-4 h-4 text-brand-tertiary" /> Pesticides Applied
                </span>
                <span className="text-white font-mono font-bold text-sm bg-brand-secondary/80 px-3 py-0.5 rounded-xl border border-brand-primary/30 shadow-inner tabular-nums">
                  {formData.pesticides_tonnes.toLocaleString()} tonnes
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={pestMin}
                  max={pestMax}
                  step="250"
                  value={formData.pesticides_tonnes}
                  onChange={(e) => setFormData({ ...formData, pesticides_tonnes: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-lg cursor-pointer accent-brand-primary"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #2DD4BF ${pestPct}%, #14211A ${pestPct}%, #14211A 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-brand-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block"></span> Minimal &lt;500t
                </span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span> Standard 1k–10kt
                </span>
                <span className="text-amber-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span> High &gt;50kt
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-brand-muted font-mono tabular-nums">
                <span>Min: {pestMin} t</span>
                <span>Median: {schemaLimits?.pest?.median ?? 3499} t</span>
                <span>Max: {pestMax.toLocaleString()} t</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="p-5 rounded-2xl bg-brand-neutral/60 border border-white/5 hover:border-brand-primary/30 transition-all space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted flex items-center gap-1.5 font-bold">
                  <Thermometer className="w-4 h-4 text-brand-tertiary" /> Mean Seasonal Temperature
                </span>
                <span className="text-white font-mono font-bold text-sm bg-brand-secondary/80 px-3 py-0.5 rounded-xl border border-brand-primary/30 shadow-inner tabular-nums">
                  {formData.avg_temp.toFixed(1)} °C
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={tempMin}
                  max={tempMax}
                  step="0.5"
                  value={formData.avg_temp}
                  onChange={(e) => setFormData({ ...formData, avg_temp: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-lg cursor-pointer accent-brand-primary"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #2DD4BF ${tempPct}%, #14211A ${tempPct}%, #14211A 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-blue-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block"></span> Frost &lt;10°C
                </span>
                <span className="text-brand-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block"></span> Optimal 18–25°C
                </span>
                <span className="text-orange-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span> Heat Stress &gt;30°C
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-brand-muted font-mono tabular-nums">
                <span>Min: {tempMin}°C</span>
                <span>Median: {schemaLimits?.temp?.median ?? 17.85}°C</span>
                <span>Max: {tempMax}°C</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-tertiary text-brand-neutral font-black tracking-wide hover:brightness-110 transition-all shadow-[0_0_30px_rgba(16,185,129,0.35)] disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? "Running Machine Learning Inference..." : "Predict Crop Harvest Yield"}
        </button>
      </form>

      {/* Yield Result Display Card (Right 1 col) */}
      <div className="card-bento rounded-3xl p-7 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted mb-2">
            📊 Harvest Forecast Output
          </div>
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-tertiary" /> Harvest Forecast
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Model: <span className="text-white font-semibold">{modelMetrics?.best_model ?? "RandomForestRegressor"}</span> (Trained Pipeline)
            </p>
          </div>

          {forecast ? (
            <div className="space-y-6">
              {/* Luminous Harvest Card */}
              <div className="relative p-7 rounded-3xl bg-gradient-to-br from-brand-secondary/80 via-brand-secondary/40 to-brand-neutral border border-brand-primary/50 text-center overflow-hidden shadow-2xl shadow-brand-primary/20">
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-tertiary font-black">
                  PROJECTED HARVEST YIELD
                </div>
                <div className="text-5xl font-black text-white mt-3 font-mono tracking-tight tabular-nums">
                  {forecast.predicted_yield_tonnes_ha} <span className="text-xl text-brand-primary font-normal">t/ha</span>
                </div>
                <p className="text-xs text-brand-muted mt-2 font-mono tabular-nums">
                  ({forecast.predicted_yield_hg_ha.toLocaleString()} hg/ha)
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-brand-neutral/80 border border-white/5 flex justify-between items-center">
                  <span className="text-brand-muted font-medium font-mono text-[11px]">CROP VARIETY</span>
                  <span className="text-white font-bold">{formData.Item}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-brand-neutral/80 border border-white/5 flex justify-between items-center">
                  <span className="text-brand-muted font-medium font-mono text-[11px]">GEOGRAPHIC AREA</span>
                  <span className="text-white font-bold">{formData.Area}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-brand-neutral/80 border border-white/5 flex justify-between items-center">
                  <span className="text-brand-muted font-medium font-mono text-[11px]">MODEL VALIDATION MAE</span>
                  <span className="text-brand-primary font-mono font-bold tabular-nums">
                    {modelMetrics?.test_mae ? Math.round(modelMetrics.test_mae).toLocaleString() : "36,003"} hg/ha
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-brand-muted text-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-secondary/40 border border-brand-primary/30 flex items-center justify-center mb-4 text-brand-primary shadow-inner">
                <div className="w-8 h-8 rounded-full border border-brand-primary/40 border-t-brand-primary animate-spin" />
              </div>
              <p className="font-bold text-white tracking-tight">Awaiting parameter submission</p>
              <p className="text-xs text-brand-muted mt-1.5 max-w-xs leading-relaxed">
                Select real FAO country, crop, and weather indicators on the left to compute legitimate yield predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
