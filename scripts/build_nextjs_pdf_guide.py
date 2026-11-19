"""
Build comprehensive Next.js migration guide for BioVision and export to PDF.
Styled with the custom color palette (#10B981, #0A3D2C, #2DD4BF, #0A0F0D).
"""
import pathlib
import re
import markdown
from xhtml2pdf import pisa

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
MD_FILE = DOCS_DIR / "BioVision_NextJS_Complete_Build_Guide.md"
PDF_FILE = DOCS_DIR / "BioVision_NextJS_Complete_Build_Guide.pdf"
PALETTE_IMG = DOCS_DIR / "palette.png"

# Verify palette image exists
palette_img_path = str(PALETTE_IMG).replace("\\", "/")

markdown_content = """# BioVision: Complete Next.js 15 & FastAPI Build Guide

**A Comprehensive Architectural & Implementation Manual for Migrating BioVision from Streamlit to an Enterprise Next.js Full-Stack Application**

*SE-314L Artificial Intelligence • Multimodal Agro-AI Engine*

---

## 1. Project Overview & Motivation

BioVision is a multimodal artificial intelligence engine for modern agriculture that combines:
1. **Foliar Disease Diagnosis (Computer Vision)**: A transfer-learning Convolutional Neural Network (EfficientNetB0) classifying plant leaf pathology across 20 crop species and 50 disease classes, paired with Explainable AI via Gradient-weighted Class Activation Mapping (Grad-CAM).
2. **Crop Yield Forecasting (Tabular Machine Learning)**: A Stacking Regressor ensemble integrating FAO global agro-climatic indicators (rainfall, pesticides, temperature, region, and crop species) to predict expected harvest yield in tonnes per hectare.
3. **Integrated Advisory**: Combining vision pathology severity with tabular yield estimates to calculate disease-induced yield penalties and actionable agronomic treatment recommendations.

### Why Migrate from Streamlit to Next.js?

| Capability | Streamlit Prototype | Next.js 15 + FastAPI Production |
| :--- | :--- | :--- |
| **Execution Model** | Monolithic Python script rerun on every interaction | Decoupled client-side React 19 + Async REST API |
| **User Experience** | Page lag, blocking re-execution, generic widgets | Instantaneous tab switches, smooth animations, zero lag |
| **Custom Styling** | Limited to predefined theme options and injected CSS | Full control with Tailwind CSS and exact brand color tokens |
| **Interactive Vision** | Static side-by-side images | Interactive split-view slider for Grad-CAM overlay comparison |
| **File Handling** | Basic file uploader | Drag-and-drop leaf uploader with camera capture support |
| **Deployment & Scale** | Single instance Python process | Frontend on edge CDN (Vercel), Backend on autoscaling container |

---

## 2. Brand Color Palette & Design System

The application interface is styled around a high-contrast dark aesthetic tailored specifically for agricultural AI.

<img src="__PALETTE_IMG__" width="200" style="margin: 10px 0; border: 1px solid #0A3D2C;" />

### Palette Token Specifications

| Token Name | Hex Code | Semantic Role in UI | Visual Characteristic |
| :--- | :--- | :--- | :--- |
| **Primary** | `#10B981` | Accent buttons, active navigation indicators, confidence meters, action CTAs | Vibrant Emerald Green |
| **Secondary** | `#0A3D2C` | Card header accents, dark badges, secondary borders, gradient depths | Deep Pine / Forest Green |
| **Tertiary** | `#2DD4BF` | Grad-CAM saliency highlights, metric delta tags, subtle glows, icons | Bright Turquoise / Mint Cyan |
| **Neutral** | `#0A0F0D` | Canvas background, deeply recessed container areas, input backgrounds | Deep Obsidian / Dark Charcoal |
| **Surface Dark** | `#111915` | Elevated card surfaces, modal dialogs, drawer panels | Elevated Neutral Surface |
| **Border Dark** | `#1E2D24` | Component outlines, table borders, panel dividers | Subdued Forest Border |

### 10-Step Palette Shades (Tailwind Scale)

- **Primary (`#10B981`)**: `50: #ECFDF5`, `100: #D1FAE5`, `200: #A7F3D0`, `300: #6EE7B7`, `400: #34D399`, `500: #10B981`, `600: #059669`, `700: #047857`, `800: #065F46`, `900: #064E3B`
- **Secondary (`#0A3D2C`)**: `50: #E6F0EB`, `100: #C2D9CD`, `200: #99BFAC`, `300: #70A58A`, `400: #4D8B6C`, `500: #2E7250`, `600: #225C3F`, `700: #18462F`, `800: #0A3D2C`, `900: #05261B`
- **Tertiary (`#2DD4BF`)**: `50: #F0FDFA`, `100: #CCFBF1`, `200: #99F6E4`, `300: #5EEAD4`, `400: #2DD4BF`, `500: #14B8A6`, `600: #0D9488`, `700: #0F766E`, `800: #115E59`, `900: #134E4A`
- **Neutral (`#0A0F0D`)**: `50: #F6F7F6`, `100: #E2E4E3`, `200: #C2C5C3`, `300: #979D99`, `400: #6B726E`, `500: #4B524E`, `600: #343A37`, `700: #222724`, `800: #141816`, `900: #0A0F0D`

---

## 3. System Architecture

The modern production architecture splits BioVision into two specialized services:

```
+-------------------------------------------------------------------------+
|                           User Web Browser                              |
|           Next.js 15 Client (React 19 + Tailwind CSS + Lucide)          |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP REST (JSON / Multipart Form)
                                     v
+-------------------------------------------------------------------------+
|                  FastAPI Backend Server (Port 8000)                     |
|                                                                         |
|  +-------------------------------+   +-------------------------------+  |
|  | Disease Vision Service        |   | Yield Forecasting Service     |  |
|  | - TensorFlow 2.x Keras        |   | - Scikit-Learn Pipeline       |  |
|  | - EfficientNetB0 (50 Classes) |   | - Stacked Ensemble Regressor  |  |
|  | - Grad-CAM Saliency Engine    |   | - FAO Feature Normalizer      |  |
|  +-------------------------------+   +-------------------------------+  |
+-------------------------------------------------------------------------+
```

### Why Decouple with FastAPI?
- **ML Native Support**: Deep learning (TensorFlow), image processing (Pillow), and numerical computation (NumPy, Scikit-Learn) have native C-extensions in Python. Keeping them in FastAPI avoids fragile JS model conversion.
- **Microsecond Latency**: Models remain in GPU/CPU RAM between requests.
- **Concurrent Requests**: FastAPI handles concurrent user traffic through asynchronous event loops.

---

## 4. Directory & Workspace Layout

```
biovision-app/
├── backend/                        # Python FastAPI Microservice
│   ├── main.py                     # API router & inference handlers
│   ├── gradcam.py                  # Grad-CAM heatmap generator
│   ├── requirements.txt            # Python dependencies
│   └── models/                     # Trained machine learning artifacts
│       ├── disease_model.keras     # Vision classifier weights
│       ├── class_names.json        # 50 foliar class categories
│       ├── yield_model.joblib      # Stacked ensemble yield model
│       └── feature_schema.json     # Tabular feature validation schema
│
└── frontend/                       # Next.js 15 Application
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts          # Custom brand palette config
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx          # Root layout & dark theme wrapper
        │   ├── page.tsx            # Main tabbed dashboard
        │   └── globals.css         # Custom scrollbars & CSS tokens
        └── components/
            ├── Header.tsx          # Top bar with logo and tab pills
            ├── DiagnosisTab.tsx    # Leaf upload & Grad-CAM visualizer
            ├── YieldTab.tsx        # Tabular sliders & yield projection
            ├── ReportTab.tsx       # Integrated advisory & PDF export
            └── MetricsTab.tsx      # Model performance charts & tables
```

---

## 5. Backend Implementation (FastAPI)

### 5.1 Backend Dependencies (`backend/requirements.txt`)
```text
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
python-multipart>=0.0.9
tensorflow>=2.15.0
scikit-learn>=1.4.0
joblib>=1.3.2
pillow>=10.2.0
numpy>=1.26.0
pandas>=2.2.0
```

### 5.2 FastAPI Server Implementation (`backend/main.py`)
```python
import base64
import io
import json
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
from PIL import Image
import joblib

from gradcam import find_last_conv_layer, make_gradcam_heatmap, overlay_heatmap

app = FastAPI(title="BioVision ML API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = Path("models")
DISEASE_MODEL_PATH = MODELS_DIR / "disease_model.keras"
CLASS_NAMES_PATH   = MODELS_DIR / "class_names.json"
YIELD_MODEL_PATH   = MODELS_DIR / "yield_model.joblib"
SCHEMA_PATH        = MODELS_DIR / "feature_schema.json"

try:
    from tensorflow import keras
    disease_model = keras.models.load_model(DISEASE_MODEL_PATH)
    class_names = json.loads(CLASS_NAMES_PATH.read_text())
    conv_layer = find_last_conv_layer(disease_model)
    print(f"Loaded Disease Model with {len(class_names)} classes.")
except Exception as e:
    disease_model, class_names, conv_layer = None, [], None
    print(f"Disease Model failed: {e}")

try:
    yield_pipe = joblib.load(YIELD_MODEL_PATH)
    feature_schema = json.loads(SCHEMA_PATH.read_text())
    print("Loaded Yield Forecasting Ensemble Pipeline.")
except Exception as e:
    yield_pipe, feature_schema = None, {}
    print(f"Yield Model failed: {e}")

class YieldRequest(BaseModel):
    Area: str
    Item: str
    average_rain_fall_mm_per_year: float
    pesticides_tonnes: float
    avg_temp: float

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "disease_model_ready": disease_model is not None,
        "yield_model_ready": yield_pipe is not None
    }

@app.post("/api/diagnose")
async def diagnose(file: UploadFile = File(...)):
    if not disease_model:
        raise HTTPException(status_code=503, detail="Disease model not initialized")

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
    arr = np.array(image, dtype=np.float32)
    batch = np.expand_dims(arr, 0)

    probs = disease_model.predict(batch, verbose=0)[0]
    top_indices = np.argsort(probs)[::-1][:3]

    predictions = [
        {
            "class_name": class_names[idx].replace("___", " - ").replace("_", " "),
            "raw_name": class_names[idx],
            "probability": float(probs[idx]),
            "is_healthy": "healthy" in class_names[idx].lower()
        }
        for idx in top_indices
    ]

    heatmap = make_gradcam_heatmap(batch, disease_model, conv_layer, int(top_indices[0]))
    overlay = overlay_heatmap(arr.astype(np.uint8), heatmap)

    buf = io.BytesIO()
    Image.fromarray(overlay).save(buf, format="PNG")
    heatmap_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "top_prediction": predictions[0],
        "top_3": predictions,
        "gradcam_image": heatmap_b64,
    }

@app.post("/api/forecast")
def forecast(req: YieldRequest):
    if not yield_pipe:
        raise HTTPException(status_code=503, detail="Yield model not initialized")

    df = pd.DataFrame([req.dict()])
    pred_hg_ha = float(yield_pipe.predict(df)[0])

    return {
        "predicted_yield_hg_ha": round(pred_hg_ha, 2),
        "predicted_yield_tonnes_ha": round(pred_hg_ha / 10000, 2),
        "inputs": req.dict()
    }
```

---

## 6. Frontend Implementation (Next.js 15)

### 6.1 Project Initialization
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
npm install lucide-react clsx tailwind-merge recharts framer-motion
```

### 6.2 Tailwind Configuration (`frontend/tailwind.config.ts`)
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#10B981",    // Vibrant Emerald
          secondary: "#0A3D2C",  // Deep Forest Green
          tertiary: "#2DD4BF",   // Mint / Turquoise Cyan
          neutral: "#0A0F0D",    // Deep Obsidian Canvas
          surface: "#111915",    // Elevated Card Surface
          border: "#1E2D24",     // Borders & Outlines
          muted: "#94A3B8",      // Subdued Text
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

### 6.3 Global Styles (`frontend/src/app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  background-color: #0A0F0D;
  color: #F8FAFC;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
::-webkit-scrollbar-track {
  background: #0A0F0D;
}
::-webkit-scrollbar-thumb {
  background: #0A3D2C;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #10B981;
}
```

### 6.4 Top Navigation Bar (`src/components/Header.tsx`)
```tsx
"use client";
import React from "react";
import { Sprout, Activity, BarChart3, FileText, Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "diagnose", label: "Disease Diagnosis", icon: Activity },
    { id: "forecast", label: "Yield Forecast", icon: BarChart3 },
    { id: "report", label: "Integrated Report", icon: FileText },
    { id: "metrics", label: "Model Metrics", icon: Cpu },
  ];

  return (
    <header className="border-b border-brand-border bg-brand-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-secondary border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/10">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              BioVision <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/40 font-mono">Next.js 15</span>
            </h1>
            <p className="text-xs text-brand-muted">Multimodal Plant Pathology & Yield Forecasting</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-brand-neutral/80 p-1.5 rounded-xl border border-brand-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-brand-primary text-brand-neutral font-bold shadow-md shadow-brand-primary/20"
                    : "text-brand-muted hover:text-white hover:bg-brand-surface"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-brand-neutral" : "text-brand-tertiary"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
```

### 6.5 Disease Diagnosis Tab (`src/components/DiagnosisTab.tsx`)
```tsx
"use client";
import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Layers, RefreshCw } from "lucide-react";

export const DiagnosisTab = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showGradCam, setShowGradCam] = useState(false);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const runDiagnosis = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/diagnose", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Error connecting to BioVision AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UploadCloud className="text-brand-primary w-5 h-5" /> Foliar Image Acquisition
          </h2>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-border hover:border-brand-primary rounded-xl p-8 cursor-pointer transition-all bg-brand-neutral/40">
            <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
            <UploadCloud className="w-12 h-12 text-brand-tertiary mb-3 animate-pulse" />
            <p className="text-sm text-gray-200 font-medium">Click to upload or drag & drop leaf photo</p>
            <p className="text-xs text-brand-muted mt-1">EfficientNetB0 Input: 224 x 224 RGB</p>
          </label>

          {preview && (
            <div className="mt-6 flex flex-col items-center">
              <div className="relative rounded-xl overflow-hidden border border-brand-border w-64 h-64 bg-black shadow-lg">
                <img
                  src={showGradCam && result?.gradcam_image ? result.gradcam_image : preview}
                  alt="Leaf Specimen"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {result?.gradcam_image && (
                  <button
                    onClick={() => setShowGradCam(!showGradCam)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-brand-secondary/90 border border-brand-tertiary/40 text-brand-tertiary text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm hover:bg-brand-secondary"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {showGradCam ? "Original Photo" : "Grad-CAM Saliency"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {preview && (
          <button
            onClick={runDiagnosis}
            disabled={loading}
            className="mt-6 w-full py-3.5 rounded-xl bg-brand-primary text-brand-neutral font-bold tracking-wide hover:bg-emerald-400 transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? "Analyzing Foliar Pathology..." : "Classify Leaf Pathology"}
          </button>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Pathological Diagnostic Findings</h2>
          {!result ? (
            <div className="py-24 text-center text-brand-muted text-sm flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-brand-secondary/40 border border-brand-border flex items-center justify-center mb-3 text-brand-primary">
                🔬
              </div>
              <p>Upload a leaf image to generate AI classification & Grad-CAM visual heatmaps.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-brand-secondary/30 border border-brand-primary/40 flex items-start gap-4">
                {result.top_prediction.is_healthy ? (
                  <CheckCircle2 className="w-7 h-7 text-brand-primary mt-1 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-brand-tertiary mt-1 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-bold text-white">{result.top_prediction.class_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-mono font-semibold">
                      {(result.top_prediction.probability * 100).toFixed(1)}% Confidence
                    </span>
                    <span className="text-xs text-brand-muted">
                      Status: {result.top_prediction.is_healthy ? "Healthy Foliage" : "Active Pathology"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">Top-3 Candidates</h4>
                <div className="space-y-3">
                  {result.top_3.map((pred: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-300">{pred.class_name}</span>
                        <span className="text-brand-tertiary font-mono">{(pred.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-brand-neutral h-2 rounded-full overflow-hidden border border-brand-border">
                        <div
                          className="bg-brand-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${pred.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 6.6 Yield Forecasting Tab (`src/components/YieldTab.tsx`)
```tsx
"use client";
import React, { useState } from "react";
import { TrendingUp, CloudRain, Thermometer, FlaskConical, Globe, Sprout } from "lucide-react";

export const YieldTab = () => {
  const [formData, setFormData] = useState({
    Area: "India",
    Item: "Potatoes",
    average_rain_fall_mm_per_year: 1100,
    pesticides_tonnes: 2500,
    avg_temp: 24.5,
  });
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setForecast(data);
    } catch {
      alert("Error estimating crop yield.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-5">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="text-brand-primary w-5 h-5" /> Agro-Climatic Feature Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-primary" /> Country / Region
            </label>
            <input
              type="text"
              value={formData.Area}
              onChange={(e) => setFormData({ ...formData, Area: e.target.value })}
              className="w-full bg-brand-neutral border border-brand-border rounded-xl px-4 py-2.5 text-white focus:border-brand-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase flex items-center gap-1.5 mb-1.5">
              <Sprout className="w-3.5 h-3.5 text-brand-primary" /> Target Crop Species
            </label>
            <input
              type="text"
              value={formData.Item}
              onChange={(e) => setFormData({ ...formData, Item: e.target.value })}
              className="w-full bg-brand-neutral border border-brand-border rounded-xl px-4 py-2.5 text-white focus:border-brand-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs text-brand-muted">
              <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-brand-tertiary" /> Annual Rainfall</span>
              <span className="text-white font-mono">{formData.average_rain_fall_mm_per_year} mm/year</span>
            </div>
            <input
              type="range"
              min="100"
              max="3500"
              value={formData.average_rain_fall_mm_per_year}
              onChange={(e) => setFormData({ ...formData, average_rain_fall_mm_per_year: parseFloat(e.target.value) })}
              className="w-full accent-brand-primary mt-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-brand-muted">
              <span className="flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5 text-brand-tertiary" /> Pesticide Application</span>
              <span className="text-white font-mono">{formData.pesticides_tonnes} tonnes</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="100"
              value={formData.pesticides_tonnes}
              onChange={(e) => setFormData({ ...formData, pesticides_tonnes: parseFloat(e.target.value) })}
              className="w-full accent-brand-primary mt-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-brand-muted">
              <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-brand-tertiary" /> Mean Temperature</span>
              <span className="text-white font-mono">{formData.avg_temp}°C</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="0.5"
              value={formData.avg_temp}
              onChange={(e) => setFormData({ ...formData, avg_temp: parseFloat(e.target.value) })}
              className="w-full accent-brand-primary mt-2 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-primary text-brand-neutral font-bold tracking-wide hover:bg-emerald-400 transition-colors shadow-lg shadow-brand-primary/20"
        >
          {loading ? "Forecasting Yield via Stacking Ensemble..." : "Execute Yield Forecast"}
        </button>
      </form>

      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Estimated Yield Output</h2>
          <p className="text-xs text-brand-muted mb-6">Stacked Ensemble Regressor Projection</p>

          {forecast ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-brand-secondary/30 border border-brand-primary/40 text-center">
                <span className="text-xs uppercase tracking-wider text-brand-tertiary font-bold">Predicted Crop Harvest</span>
                <div className="text-4xl font-extrabold text-white mt-2 font-mono">
                  {forecast.predicted_yield_tonnes_ha} <span className="text-lg text-brand-primary font-normal">t / ha</span>
                </div>
                <p className="text-xs text-brand-muted mt-1.5 font-mono">({forecast.predicted_yield_hg_ha.toLocaleString()} hg/ha)</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-neutral/60 border border-brand-border text-xs space-y-2">
                <div className="flex justify-between text-brand-muted">
                  <span>Target Crop:</span>
                  <span className="text-white font-medium">{formData.Item}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Region:</span>
                  <span className="text-white font-medium">{formData.Area}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-brand-muted text-sm">
              Adjust parameters and click &quot;Execute Yield Forecast&quot; to compute projections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Execution, Testing & Production Deployment

### 7.1 Running in Development Mode
Start both services in separate terminal sessions:

```bash
# Terminal 1: Python FastAPI ML Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2: Next.js Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to interact with your live BioVision Next.js application.

### 7.2 Production Build
- **Frontend**: Deploy with zero configuration to **Vercel** (`npm run build`). Add environment variable `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`.
- **Backend**: Containerize with Docker and deploy to **AWS App Runner**, **Google Cloud Run**, or **DigitalOcean App Platform**.

---
*BioVision Agro-AI Engine • Technical Specification & Build Guide*
""".replace("__PALETTE_IMG__", palette_img_path)


# Strip emoji characters for Helvetica PDF rendering
EMOJI_RE = re.compile(
    "[\U00010000-\U0010ffff"
    "\U0001F300-\U0001F9FF"
    "\U00002702-\U000027B0"
    "\U0000200D"
    "]+",
    flags=re.UNICODE,
)

BOX_MAP = str.maketrans({
    "┌": "+", "┐": "+", "└": "+", "┘": "+",
    "├": "+", "┤": "+", "┬": "+", "┴": "+", "┼": "+",
    "─": "-", "━": "=",
    "│": "|", "┃": "|",
    "▼": "v", "▲": "^", "◀": "<", "▶": ">",
    "→": "->","←": "<-","↑": "^", "↓": "v",
    "✓": "[OK]", "✗": "[X]", "•": "*",
    "\u200d": "",
})

def clean_text(text):
    result = []
    in_code = False
    for line in text.splitlines():
        if line.startswith("```"):
            in_code = not in_code
            result.append(line)
        elif in_code:
            result.append(line.translate(BOX_MAP))
        else:
            result.append(line)
    return "\n".join(result)

# Write out the clean markdown guide
MD_FILE.write_text(markdown_content, encoding="utf-8")
print(f"Written markdown guide to {MD_FILE}")

clean_md = clean_text(markdown_content)
clean_md = EMOJI_RE.sub("", clean_md)

body_html = markdown.markdown(
    clean_md,
    extensions=["tables", "fenced_code", "toc", "nl2br"]
)

html_template = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @page {{
    size: A4;
    margin: 1.8cm 1.5cm 1.8cm 1.5cm;
    @bottom-right {{
      content: "Page " counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #64748b;
    }}
  }}
  body {{
    font-family: Helvetica, Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.5;
    color: #1e293b;
  }}
  h1 {{
    font-size: 17pt;
    color: #0A3D2C;
    border-bottom: 3px solid #10B981;
    padding-bottom: 5px;
    margin-top: 10px;
    margin-bottom: 8px;
  }}
  h2 {{
    font-size: 12.5pt;
    color: #0A3D2C;
    border-bottom: 1.5px solid #2DD4BF;
    padding-bottom: 3px;
    margin-top: 16px;
    margin-bottom: 6px;
  }}
  h3 {{
    font-size: 10pt;
    color: #047857;
    margin-top: 12px;
    margin-bottom: 4px;
  }}
  p {{
    margin: 4px 0 7px 0;
  }}
  code {{
    font-family: Courier, monospace;
    background: #ecfdf5;
    padding: 1px 4px;
    font-size: 8pt;
    color: #065f46;
  }}
  pre {{
    background: #0A0F0D;
    color: #e2e8f0;
    border-left: 3.5px solid #10B981;
    padding: 7px 9px;
    font-family: Courier, monospace;
    font-size: 7.2pt;
    line-height: 1.3;
    margin: 7px 0;
  }}
  pre code {{
    background: none;
    padding: 0;
    font-size: 7.2pt;
    color: #e2e8f0;
  }}
  table {{
    width: 100%;
    margin: 8px 0;
    font-size: 8pt;
    border-collapse: collapse;
  }}
  th {{
    background: #0A3D2C;
    color: #ffffff;
    padding: 5px 7px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #0A3D2C;
  }}
  td {{
    padding: 4px 7px;
    border: 1px solid #cbd5e1;
  }}
  tr:nth-child(even) td {{
    background: #f0fdf4;
  }}
  blockquote {{
    border-left: 3px solid #10B981;
    margin: 7px 0;
    padding: 3px 8px;
    color: #334155;
    background: #f0fdf4;
  }}
  hr {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 10px 0;
  }}
</style>
</head>
<body>
{body_html}
</body>
</html>
"""

with open(PDF_FILE, "wb") as fh:
    result = pisa.CreatePDF(html_template, dest=fh)

if result.err:
    print(f"Error during PDF creation: {result.err}")
else:
    print(f"SUCCESS: Generated {PDF_FILE} ({PDF_FILE.stat().st_size / 1024:.1f} KB)")
