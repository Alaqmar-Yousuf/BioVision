"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import defaultSchema from "@/config/schema.json";
import {
  TrendingUp,
  CloudRain,
  Thermometer,
  FlaskConical,
  Globe,
  Sprout,
  BarChart2,
  ShieldCheck,
  RefreshCw,
  Clock,
  ChevronDown,
  CheckCircle2
} from "lucide-react";

interface YieldTabProps {
  onYieldComplete?: (yieldData: any) => void;
  preselectedCrop?: string | null;
}

const UPCOMING_VISION_CROPS_NAMES = [
  "Barley", "Carrots and turnips", "Dates", "Papayas", "Pears", "Pineapples", "Spinach"
];

// FAO crop names that have NO pathology vision model
const NO_VISION_FAO_CROPS = new Set([
  "Barley",
  "Carrots and turnips",
  "Dates",
  "Papayas",
  "Pears",
  "Pineapples",
  "Spinach",
]);

export const YieldTab: React.FC<YieldTabProps> = ({ onYieldComplete, preselectedCrop }) => {
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

  // Auto-select crop from diagnosis result
  useEffect(() => {
    if (preselectedCrop) {
      setFormData((prev) => ({ ...prev, Item: preselectedCrop }));
    }
  }, [preselectedCrop]);

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

  const isUpcoming = NO_VISION_FAO_CROPS.has(formData.Item);

  const rainPct = ((formData.average_rain_fall_mm_per_year - rainMin) / (rainMax - rainMin)) * 100;
  const pestPct = ((formData.pesticides_tonnes - pestMin) / (pestMax - pestMin)) * 100;
  const tempPct = ((formData.avg_temp - tempMin) / (tempMax - tempMin)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Parameter Control Panel (Left 2 cols) */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-3xl border border-[#C8E6C9]/[0.08] bg-[#102A20]/70 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-[0_20px_50px_rgba(3,10,8,0.6)]">
        <div className="space-y-6">
          <div className="border-b border-[#C8E6C9]/[0.06] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#071C16] border border-[#B7F36B]/20 flex items-center justify-center text-[#B7F36B]">
                  <TrendingUp className="w-4 h-4 text-[#B7F36B]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F3F5EC] tracking-tight uppercase font-display">
                    Agro-Climatic Yield Forecasting
                  </h2>
                  <p className="text-[11px] font-mono text-[#829B87]">
                    Model: {modelMetrics?.best_model ?? "RandomForestRegressor"} &bull; 31,621 FAO Global Observations
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium px-3 py-1 rounded-full bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/20 flex items-center gap-1.5 tabular-nums self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B7F36B]" /> Test R² = {modelMetrics?.test_r2 ? modelMetrics.test_r2.toFixed(4) : "0.9022"}
              </span>
            </div>
          </div>

          {/* Auto-selected notification */}
          {preselectedCrop && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#B7F36B]/10 border border-[#B7F36B]/20 text-xs font-mono text-[#C8E6C9]">
              <CheckCircle2 className="w-4 h-4 text-[#B7F36B] flex-shrink-0" />
              <span>
                Target crop synchronized from foliar pathology: <strong className="text-white">{preselectedCrop}</strong>
              </span>
            </div>
          )}

          {/* Precision Country & Crop Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#829B87] flex items-center gap-1.5 mb-2">
                <Globe className="w-3.5 h-3.5 text-[#C8E6C9]" /> Country / Region ({countries.length} FAO Countries)
              </label>
              <div className="relative">
                <select
                  value={formData.Area}
                  onChange={(e) => setFormData({ ...formData, Area: e.target.value })}
                  className="w-full bg-[#071C16] border border-[#C8E6C9]/15 rounded-xl px-4 py-2.5 text-[#F3F5EC] appearance-none focus:border-[#B7F36B] focus:outline-none cursor-pointer transition-all text-xs font-mono"
                >
                  {countries.length > 0 ? (
                    countries.map((c, i) => <option key={i} value={c} className="bg-[#071C16] text-[#F3F5EC]">{c}</option>)
                  ) : (
                    <option value="India" className="bg-[#071C16] text-[#F3F5EC]">India</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#829B87] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#829B87] flex items-center gap-1.5 mb-2">
                <Sprout className="w-3.5 h-3.5 text-[#C8E6C9]" /> Target Crop ({crops.length} FAO Crop Types)
              </label>
              <div className="relative">
                <select
                  value={formData.Item}
                  onChange={(e) => setFormData({ ...formData, Item: e.target.value })}
                  className="w-full bg-[#071C16] border border-[#C8E6C9]/15 rounded-xl px-4 py-2.5 text-[#F3F5EC] appearance-none focus:border-[#B7F36B] focus:outline-none cursor-pointer transition-all text-xs font-mono"
                >
                  {crops.length > 0 ? (
                    <>
                      <optgroup label="Vision Active + Yield Forecast" className="bg-[#071C16] text-[#829B87]">
                        {crops.filter(cr => !NO_VISION_FAO_CROPS.has(cr)).map((cr, i) => (
                          <option key={i} value={cr} className="bg-[#071C16] text-[#F3F5EC]">{cr}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Yield Forecast Active (Vision Roadmap)" className="bg-[#071C16] text-[#829B87]">
                        {crops.filter(cr => NO_VISION_FAO_CROPS.has(cr)).map((cr, i) => (
                          <option key={i} value={cr} className="bg-[#071C16] text-[#C8E6C9]">{cr} — Vision in Roadmap</option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    <option value="Potatoes" className="bg-[#071C16] text-[#F3F5EC]">Potatoes</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#829B87] pointer-events-none" />
              </div>
              {(isUpcoming || NO_VISION_FAO_CROPS.has(formData.Item)) && (
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-[#071C16]/60 border border-[#C8E6C9]/10 flex items-center gap-2 text-[10px] font-mono text-[#829B87]">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Yield Model Active &bull; Foliar Pathology in upcoming release</span>
                </div>
              )}
            </div>
          </div>

          {/* Tactile Sliders with Feedback */}
          <div className="space-y-4 pt-1">
            {/* Rainfall */}
            <div className="p-4 rounded-2xl bg-[#071C16]/60 border border-[#C8E6C9]/10 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#829B87] flex items-center gap-1.5 font-mono text-[11px]">
                  <CloudRain className="w-3.5 h-3.5 text-[#C8E6C9]" /> Annual Precipitation (Rainfall)
                </span>
                <span className="text-[#F3F5EC] font-mono font-bold text-xs bg-[#102A20] px-3 py-1 rounded-lg border border-[#C8E6C9]/15 tabular-nums">
                  {formData.average_rain_fall_mm_per_year} mm/yr
                </span>
              </div>
              <input
                type="range"
                min={rainMin}
                max={rainMax}
                step="10"
                value={formData.average_rain_fall_mm_per_year}
                onChange={(e) => setFormData({ ...formData, average_rain_fall_mm_per_year: parseFloat(e.target.value) })}
                className="w-full h-1.5 rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #B7F36B 0%, #C8E6C9 ${rainPct}%, #102A20 ${rainPct}%, #102A20 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-[#829B87] font-mono tabular-nums">
                <span>Min: {rainMin} mm</span>
                <span>Median: {schemaLimits?.rain?.median ?? 788} mm</span>
                <span>Max: {rainMax} mm</span>
              </div>
            </div>

            {/* Pesticides */}
            <div className="p-4 rounded-2xl bg-[#071C16]/60 border border-[#C8E6C9]/10 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#829B87] flex items-center gap-1.5 font-mono text-[11px]">
                  <FlaskConical className="w-3.5 h-3.5 text-[#B7F36B]" /> Pesticides Applied
                </span>
                <span className="text-[#F3F5EC] font-mono font-bold text-xs bg-[#102A20] px-3 py-1 rounded-lg border border-[#C8E6C9]/15 tabular-nums">
                  {formData.pesticides_tonnes.toLocaleString()} tonnes
                </span>
              </div>
              <input
                type="range"
                min={pestMin}
                max={pestMax}
                step="250"
                value={formData.pesticides_tonnes}
                onChange={(e) => setFormData({ ...formData, pesticides_tonnes: parseFloat(e.target.value) })}
                className="w-full h-1.5 rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #B7F36B 0%, #C8E6C9 ${pestPct}%, #102A20 ${pestPct}%, #102A20 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-[#829B87] font-mono tabular-nums">
                <span>Min: {pestMin} t</span>
                <span>Median: {schemaLimits?.pest?.median ?? 3499} t</span>
                <span>Max: {pestMax.toLocaleString()} t</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-2xl bg-[#071C16]/60 border border-[#C8E6C9]/10 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#829B87] flex items-center gap-1.5 font-mono text-[11px]">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Mean Seasonal Temperature
                </span>
                <span className="text-[#F3F5EC] font-mono font-bold text-xs bg-[#102A20] px-3 py-1 rounded-lg border border-[#C8E6C9]/15 tabular-nums">
                  {formData.avg_temp.toFixed(1)} &deg;C
                </span>
              </div>
              <input
                type="range"
                min={tempMin}
                max={tempMax}
                step="0.5"
                value={formData.avg_temp}
                onChange={(e) => setFormData({ ...formData, avg_temp: parseFloat(e.target.value) })}
                className="w-full h-1.5 rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #B7F36B 0%, #F59E0B ${tempPct}%, #102A20 ${tempPct}%, #102A20 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-[#829B87] font-mono tabular-nums">
                <span>Min: {tempMin}&deg;C</span>
                <span>Median: {schemaLimits?.temp?.median ?? 17.85}&deg;C</span>
                <span>Max: {tempMax}&deg;C</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-[#B7F36B] hover:bg-[#C6F786] text-[#071C16] font-bold text-sm tracking-tight transition-all duration-300 hover:shadow-[0_0_35px_rgba(183,243,107,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? "Computing Yield Regressor..." : "Predict Crop Harvest Yield"}
        </button>
      </form>

      {/* Yield Result Display Card (Right 1 col) */}
      <div className="rounded-3xl border border-[#C8E6C9]/[0.08] bg-[#102A20]/70 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(3,10,8,0.6)]">
        <div>
          <div className="border-b border-[#C8E6C9]/[0.06] pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#071C16] border border-[#B7F36B]/20 flex items-center justify-center text-[#B7F36B]">
                <BarChart2 className="w-4 h-4 text-[#B7F36B]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F3F5EC] tracking-tight uppercase font-display">
                  Forecast Telemetry
                </h2>
                <p className="text-[11px] font-mono text-[#829B87]">RandomForest Harvest Projection</p>
              </div>
            </div>
          </div>

          {forecast ? (
            <div className="space-y-6">
              {/* Luminous Harvest Card */}
              <div className="relative p-6 rounded-2xl bg-[#071C16]/90 border border-[#B7F36B]/30 text-center overflow-hidden shadow-[0_0_30px_rgba(183,243,107,0.15)]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B7F36B] font-semibold">
                  PROJECTED HARVEST YIELD
                </div>
                <div className="text-5xl font-black text-[#F3F5EC] mt-3 font-mono tracking-tight tabular-nums">
                  {forecast.predicted_yield_tonnes_ha} <span className="text-lg text-[#B7F36B] font-normal">t/ha</span>
                </div>
                <p className="text-xs text-[#829B87] mt-2 font-mono tabular-nums">
                  ({forecast.predicted_yield_hg_ha.toLocaleString()} hg/ha)
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#071C16]/50 border border-[#C8E6C9]/10 flex justify-between items-center">
                  <span className="text-[#829B87] text-[10px] uppercase">CROP VARIETY</span>
                  <span className="text-[#F3F5EC] font-bold">{formData.Item}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#071C16]/50 border border-[#C8E6C9]/10 flex justify-between items-center">
                  <span className="text-[#829B87] text-[10px] uppercase">GEOGRAPHIC AREA</span>
                  <span className="text-[#F3F5EC] font-bold">{formData.Area}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#071C16]/50 border border-[#C8E6C9]/10 flex justify-between items-center">
                  <span className="text-[#829B87] text-[10px] uppercase">VALIDATION MAE</span>
                  <span className="text-[#B7F36B] font-bold tabular-nums">
                    {modelMetrics?.test_mae ? Math.round(modelMetrics.test_mae).toLocaleString() : "36,003"} hg/ha
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-[#829B87] text-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#071C16] border border-[#C8E6C9]/10 flex items-center justify-center mb-3 text-[#829B87]">
                <BarChart2 className="w-5 h-5 text-[#829B87]" />
              </div>
              <p className="font-semibold text-[#F3F5EC] tracking-tight">Awaiting parameter submission</p>
              <p className="text-xs text-[#829B87] mt-1.5 max-w-xs leading-relaxed font-mono">
                Select FAO region, crop, and weather indicators to compute empirical harvest yields.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
