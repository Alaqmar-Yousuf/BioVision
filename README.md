# 🌿 BioVision: Autonomous Multimodal Agricultural AI Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18-FF6F00?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.6-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

**A high-precision, decoupled multimodal artificial intelligence platform combining deep foliar pathology vision with macro agro-climatic yield synthesis.**

[Live Web Experience](https://bio-vision-pied.vercel.app/) • [API Documentation](#-rest-api-reference) • [Architecture](#-system-architecture) • [Getting Started](#-local-development-setup)

</div>

---

## 📖 Executive Summary

Modern agriculture faces a dual crisis: catastrophic yield losses due to misidentified foliar pathogens, and compounding climatic instability. **BioVision** bridges cellular micro-pathology with planetary macro-agronomy into a unified, autonomous intelligence engine.

1. **Deep Foliar Pathology Vision**: Real-time identification across **62 disease classes** and **20 agricultural crop species** using a fine-tuned EfficientNetB0 neural architecture, delivering **96.56% holdout test accuracy**.
2. **Grad-CAM Saliency Explainability**: Instant generation of class-discriminative gradient heatmaps, revealing the exact symptomatic cellular lesion zones that triggered the neural classification.
3. **Agro-Climatic Yield Synthesis**: Multi-factor harvest forecasting across **26 FAO global benchmark crops** using an agro-environmental RandomForest regressor ($R^2 = 0.9022$) trained on 31,621 country-crop harvest observations.
4. **Cross-Module Synchronization**: Diagnosed leaf specimens automatically synchronize with corresponding FAO crop profiles, computing pathology yield-loss penalties and generating downloadable/printable official field assessment dossiers.
5. **Organic Futurism Interface**: Designed to Awwwards-inspired standards, featuring an interactive photosynthetic particle fluid simulation, floating glassmorphic island navigation, Lenis momentum scrolling, and dual-mode Grad-CAM split-sliders.

---

## 🏛️ System Architecture

BioVision operates on a decoupled client-server architecture separating high-performance neural inference from the edge presentation layer:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Next.js 15 Client Layer                               │
│  - React 19 App Router & Server/Client Components                               │
│  - Living Photosynthetic Particle Fluid Simulation (Canvas 2D)                 │
│  - Floating Glassmorphic Capsule Navigation Island (Framer Motion)              │
│  - Dual-Mode Grad-CAM Inspection Engine (Split vs. Alpha Blend)                 │
│  - Lenis Smooth Momentum Scrolling Provider                                     │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ JSON / Multipart HTTP REST
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Machine Learning Microservice                      │
│  - Asynchronous Request Routing & CORS Control                                  │
│  - Automatic Model Weight Resolution & Dynamic Memory Allocation                │
│  - Dual Inference Pipelines: Tensor Batching & Scikit-Learn Estimators          │
└──────────────────┬──────────────────────────────────────────────┬───────────────┘
                   │                                              │
                   ▼                                              ▼
┌──────────────────────────────────────┐       ┌──────────────────────────────────┐
│     Vision Diagnostic Subsystem      │       │     Yield Prediction Subsystem   │
│  - Architecture: EfficientNetB0      │       │  - Algorithm: RandomForest Reg.  │
│  - Input: 224x224 RGB Leaf Tensors   │       │  - Features: Area, Item, Rain,   │
│  - Output: 62 Probability Classes    │       │    Pesticides, Avg Temperature   │
│  - Explainability: Grad-CAM Saliency │       │  - Output: Predicted Yield       │
│    (Top Conv Layer Activation Map)   │       │    (hg/ha & Tonnes/ha)           │
└──────────────────────────────────────┘       └──────────────────────────────────┘
```

---

## 🔬 Empirical Model Benchmarks

All models were evaluated on independent, verified holdout test partitions with empirical artifact verification:

### 1. Foliar Pathology Classifier (EfficientNetB0)
- **Architecture**: EfficientNetB0 with GlobalAveragePooling2D, BatchNormalization, Dropout, and Softmax dense classification.
- **Holdout Test Accuracy**: **96.56%** (`0.9656`)
- **Macro F1-Score**: **96.88%** (`0.9688`)
- **Evaluated Test Specimens**: **4,249 holdout leaves**
- **Classes**: 62 pathological and healthy states across 20 agricultural crop species.
- **Explainability**: Custom Grad-CAM implementation extracting gradients from `top_conv` layer, normalized through bicubic heatmaps and jet colormap overlays.

### 2. Agro-Climatic Yield Regressor (RandomForestRegressor)
- **Algorithm**: Multi-input RandomForestRegressor pipeline with categorical OneHotEncoding and numerical StandardScaler.
- **Training Corpus**: **31,621 country-crop records** from the UN Food and Agriculture Organization (FAO).
- **Coefficient of Determination ($R^2$)**: **0.9022** on holdout test partition.
- **Mean Absolute Error (MAE)**: **36,003.12 hg/ha** (representing ~3.6 tonnes/ha across global yield distributions spanning 849 to 5,239,278 hg/ha).
- **Root Mean Squared Error (RMSE)**: 90,174.33 hg/ha.
- **Key Predictive Drivers**: Historical geographic area profile, baseline crop genetic yield ceiling, cumulative annual rainfall, pesticide loading, and mean seasonal temperature.

---

## 📂 Project Directory Structure

```
ai-project/
├── backend/                        # FastAPI Machine Learning Microservice
│   ├── main.py                     # API routing, model serving & cross-synthesis logic
│   ├── gradcam.py                  # Grad-CAM heatmap extraction & jet colormap blending
│   ├── requirements.txt            # Python dependencies (FastAPI, TF, Scikit-Learn)
│   ├── Dockerfile                  # Containerized deployment blueprint
│   └── Procfile                    # Cloud platform process definition
│
├── frontend/                       # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Font declarations (Space Grotesk, Plus Jakarta Sans), SEO
│   │   │   ├── globals.css         # Organic Futurism CSS design tokens & animations
│   │   │   └── page.tsx            # Main application coordinator & cross-tab state manager
│   │   ├── components/
│   │   │   ├── Header.tsx          # Floating glass capsule island with active motion pill
│   │   │   ├── Footer.tsx          # Minimalist footer with quick scroll-to-top
│   │   │   ├── SmoothScrollProvider.tsx # Lenis momentum smooth scrolling provider
│   │   │   ├── RadialGauge.tsx     # Animated SVG confidence and severity gauges
│   │   │   ├── ImageComparisonSlider.tsx # Interactive split-screen Grad-CAM slider
│   │   │   ├── hero/
│   │   │   │   ├── BioPrismHero.tsx        # High-contrast hero section with CTAs & cards
│   │   │   │   └── ParticleFluidCanvas.tsx # Living photosynthetic particle simulation
│   │   │   ├── crops/
│   │   │   │   └── CropCoverageSection.tsx # Filterable 26-crop taxonomy with search
│   │   │   └── tabs/
│   │   │       ├── DiagnosisTab.tsx        # Drag-and-drop dropzone, scan line, Grad-CAM
│   │   │       ├── YieldTab.tsx            # Tactile environmental sliders & FAO forecaster
│   │   │       ├── ReportTab.tsx           # Printable official field assessment dossier
│   │   │       └── MetricsTab.tsx          # Empirical test curves, confusion matrix modal
│   │   └── config/
│   │       ├── api.ts              # API URL endpoint configuration
│   │       └── schema.json         # Bundled offline fallback schema
│   ├── public/reports/             # Statically bundled training curves & confusion matrix
│   ├── package.json
│   └── next.config.ts
│
├── models/                         # Serialized Production Model Artifacts
│   ├── disease_model.keras         # Trained EfficientNetB0 Keras neural weights (~29 MB)
│   ├── class_names.json            # 62 class taxonomy index labels
│   ├── yield_model.joblib          # Trained RandomForestRegressor pipeline (~47 MB)
│   └── feature_schema.json         # Pre-extracted countries, crops & parameter limits
│
├── reports/                        # Empirical Training & Evaluation Evidence
│   ├── classifier_metrics.json     # Test accuracy, macro F1, sample counts
│   ├── yield_metrics.json          # Test R^2, MAE, RMSE metrics
│   ├── confusion_matrix.png        # 62x62 normalized confusion matrix plot
│   ├── training_curves.png         # Accuracy & loss progression curves
│   ├── yield_actual_vs_pred.png    # Parity scatter plot of harvest predictions
│   └── yield_importance.png        # Gini feature importance distribution
│
├── scripts/                        # Model Training & Dataset Preprocessing Scripts
│   ├── train_classifier.py         # Keras classifier training pipeline
│   ├── train_yield.py              # Scikit-learn yield regression pipeline
│   ├── build_fao_dataset.py        # FAO raw data ingest & normalization
│   └── BioVision_Colab_Training.ipynb # GPU training notebook
│
├── .gitignore                      # Ignore rule protecting large datasets & caches
├── datasets.zip                    # Raw dataset archive (ignored by Git)
├── docs.zip                        # Project documentation archive
└── README.md                       # Comprehensive platform documentation
```

---

## 🚀 Local Development Setup

Follow these steps to run both the FastAPI ML backend and Next.js frontend locally:

### Prerequisites
- **Python**: Version 3.10, 3.11, or 3.12
- **Node.js**: Version 18.18+ or 20+
- **npm** or **pnpm**

---

### Step 1: Start the Backend (FastAPI)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/biovision.git
cd biovision

# 2. (Optional) Create and activate a Python virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Start the FastAPI development server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Alternative Redoc Documentation**: `http://127.0.0.1:8000/redoc`

---

### Step 2: Start the Frontend (Next.js 15)

Open a **new terminal window** in the project directory:

```bash
# 1. Navigate into the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```

- **Frontend Application**: `http://localhost:3000`

> **Note on Offline Fallbacks**: The frontend includes pre-bundled offline schemas (`feature_schema.json`) and pre-rendered metric plots in `frontend/public/reports/`. If the backend is temporarily offline, the frontend will automatically enter standby mode while preserving full browsing capability across the taxonomy and historical benchmarks.

---

## 📡 REST API Reference

The FastAPI service exposes the following standardized endpoints:

### 1. `GET /api/health`
Health check endpoint reporting model loading states and active class counts.

**Response (`200 OK`):**
```json
{
  "status": "online",
  "disease_model_loaded": true,
  "yield_model_loaded": true,
  "classes_count": 62
}
```

---

### 2. `GET /api/schema`
Returns valid countries, crops, and statistical bounding thresholds extracted from the 31,621 FAO records.

**Response (`200 OK`):**
```json
{
  "areas": ["Albania", "Algeria", "Argentina", "..."],
  "items": ["Apples", "Bananas", "Maize (corn)", "Potatoes", "Tomatoes", "..."],
  "stats": {
    "average_rain_fall_mm_per_year": { "min": 51.0, "max": 3240.0, "mean": 1149.0 },
    "pesticides_tonnes": { "min": 0.04, "max": 398000.0, "mean": 37076.9 },
    "avg_temp": { "min": 1.3, "max": 30.65, "mean": 16.1 }
  }
}
```

---

### 3. `POST /api/diagnose`
Accepts a leaf image file, executes EfficientNetB0 inference, computes Grad-CAM saliency heatmaps, and correlates with FAO crop taxonomy.

- **Request**: `multipart/form-data` with field `file` (image: JPEG, PNG, WebP)
- **Response (`200 OK`):**
```json
{
  "top_prediction": {
    "class_name": "Tomato — Early Blight",
    "raw_name": "Tomato___Early_blight",
    "crop": "Tomato",
    "disease": "Early blight",
    "probability": 0.9942,
    "is_healthy": false
  },
  "top_3": [
    {
      "class_name": "Tomato — Early Blight",
      "probability": 0.9942,
      "is_healthy": false
    },
    {
      "class_name": "Tomato — Target Spot",
      "probability": 0.0038,
      "is_healthy": false
    },
    {
      "class_name": "Tomato — Late Blight",
      "probability": 0.0012,
      "is_healthy": false
    }
  ],
  "gradcam_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "matched_fao_crop": "Tomatoes"
}
```

---

### 4. `POST /api/forecast`
Executes agro-climatic harvest projection via the trained Scikit-Learn RandomForest pipeline.

- **Request**: `application/json`
```json
{
  "Area": "United States",
  "Item": "Tomatoes",
  "average_rain_fall_mm_per_year": 1050.0,
  "pesticides_tonnes": 42000.0,
  "avg_temp": 18.5
}
```

- **Response (`200 OK`):**
```json
{
  "predicted_yield_hg_ha": 842150.25,
  "predicted_yield_tonnes_ha": 84.22,
  "inputs": {
    "Area": "United States",
    "Item": "Tomatoes",
    "average_rain_fall_mm_per_year": 1050.0,
    "pesticides_tonnes": 42000.0,
    "avg_temp": 18.5
  }
}
```

---

### 5. `GET /api/metrics`
Delivers verified holdout validation metrics and flags for empirical evaluation charts.

---

### 6. `GET /api/reports/image/{filename}`
Serves actual generated evaluation plots (`confusion_matrix.png`, `training_curves.png`, `yield_actual_vs_pred.png`, `yield_importance.png`).

---

## 🌿 Taxonomic Crop Coverage (26 Crops)

BioVision supports a comprehensive dual-tier agricultural taxonomy:

| Crop Species | Vision Classifier (62 Classes) | FAO Yield Model | Associated Pathologies Identified |
|:---|:---:|:---:|:---|
| **Apple** | ✅ Active | ✅ Active | Scab, Black Rot, Cedar Rust, Healthy |
| **Banana** | ✅ Active | ✅ Active | Sigatoka, Panama Disease, Healthy |
| **Blueberry** | ✅ Active | ✅ Active | Foliar Blight, Healthy |
| **Cherry** | ✅ Active | ✅ Active | Powdery Mildew, Healthy |
| **Corn (Maize)** | ✅ Active | ✅ Active | Cercospora Gray Leaf Spot, Common Rust, Northern Blight, Healthy |
| **Cucumber** | ✅ Active | ✅ Active | Downy Mildew, Anthracnose, Healthy |
| **Grape** | ✅ Active | ✅ Active | Black Rot, Esca (Black Measles), Leaf Blight, Healthy |
| **Mango** | ✅ Active | ✅ Active | Anthracnose, Malformation, Healthy |
| **Orange** | ✅ Active | ✅ Active | Citrus Greening (Huanglongbing), Healthy |
| **Peach** | ✅ Active | ✅ Active | Bacterial Spot, Healthy |
| **Pepper (Bell)** | ✅ Active | ✅ Active | Bacterial Spot, Healthy |
| **Potato** | ✅ Active | ✅ Active | Early Blight, Late Blight, Healthy |
| **Raspberry** | ✅ Active | ✅ Active | Foliar Blight, Healthy |
| **Rice** | ✅ Active | ✅ Active | Brown Spot, Neck Blast, Bacterial Blight, Healthy |
| **Soybean** | ✅ Active | ✅ Active | Foliar Blight, Healthy |
| **Squash** | ✅ Active | ✅ Active | Powdery Mildew, Healthy |
| **Strawberry** | ✅ Active | ✅ Active | Leaf Scorch, Healthy |
| **Tomato** | ✅ Active | ✅ Active | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |
| **Watermelon** | ✅ Active | ✅ Active | Anthracnose, Downy Mildew, Healthy |
| **Wheat** | ✅ Active | ✅ Active | Brown Rust, Yellow Rust, Septoria, Healthy |
| **Barley** | ⏳ Yield Only | ✅ Active | Macro FAO Benchmark Regressor |
| **Carrots & Turnips** | ⏳ Yield Only | ✅ Active | Macro FAO Benchmark Regressor |
| **Dates** | ⏳ Yield Only | ✅ Active | Macro FAO Benchmark Regressor |
| **Papayas** | ⏳ Yield Only | ✅ Active | Macro FAO Benchmark Regressor |
| **Pears** | ⏳ Yield Only | ✅ Active | Macro FAO Benchmark Regressor |
| **Pineapples** | ⏳ Yield Only | ✅ Active | Macro FAO Benchmark Regressor |

---

## ☁️ Cloud Deployment Guide

### Deploying the Frontend on Vercel

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New Project"** and import the repository.
3. Configure **Project Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (automatically detected)
   - **Build Command**: `next build` (or `next build --webpack`)
4. Configure **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your deployed FastAPI backend URL (e.g. `https://biovision-api.onrender.com` or your cloud server address).
5. Click **Deploy**.

---

### Deploying the Backend (Docker / Render / Railway)

The backend includes a production-ready `backend/Dockerfile` configured for containerized deployment:

#### Deploying with Docker:
```bash
# Build the Docker image from project root
docker build -t biovision-backend -f backend/Dockerfile .

# Run the container exposing port 8000
docker run -d -p 8000:8000 --name biovision-api biovision-backend
```

#### Deploying on Render:
1. Connect your repository to [Render](https://render.com).
2. Create a new **Web Service** pointing to the `backend/` directory or use `render.yaml`.
3. Set the runtime to **Docker** (or Python with start command `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`).

---

## 🛡️ Security & Environmental Best Practices

- **Sanitized Uploads**: Image uploads are validated, converted strictly to RGB, resized in-memory to 224x224, and never written unescaped to disk.
- **CORS Protection**: Standardized cross-origin resource sharing configured for production domain whitelisting.
- **Fail-Safe Design**: Missing model weights trigger explicit HTTP 503 service advisories with detailed diagnostics rather than unhandled server faults.
- **Resource Optimized**: The Next.js frontend uses client-side particle pooling and animation frame clamping to preserve mobile battery longevity.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for further details. Developed as an autonomous multimodal artificial intelligence research platform for sustainable agronomy and computational phytopathology.
