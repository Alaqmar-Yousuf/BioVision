# 🌿 BioVision: Multimodal Agro-AI Engine

> **Next-Generation Foliar Pathology Detection & Agro-Climatic Yield Synthesis**  
> *Developed for SE-314L Artificial Intelligence • 62 Disease Classes • 26 Global Crops*

---

## 🏛️ System Architecture

BioVision operates on a decoupled multimodal architecture:

```
                      ┌────────────────────────────────────────┐
                      │        Next.js 15 Frontend             │
                      │  (Bento-Box UI, Tailwind CSS, Vercel)  │
                      └──────────────────┬─────────────────────┘
                                         │ REST API
                                         ▼
                      ┌────────────────────────────────────────┐
                      │        FastAPI Machine Learning        │
                      │   (TensorFlow, Scikit-Learn, Docker)   │
                      └────────────┬───────────────┬───────────┘
                                   │               │
                                   ▼               ▼
                      ┌──────────────────┐   ┌─────────────────┐
                      │ EfficientNetB0   │   │ RandomForest    │
                      │ 62-Class Vision  │   │ Yield Regressor │
                      │ + Grad-CAM Heat  │   │ (FAO Benchmarks)│
                      └──────────────────┘   └─────────────────┘
```

- **Frontend (`frontend/`)**: Next.js 15 (React 19), Tailwind CSS v4, custom glassmorphism, dynamic SVG circular & arc gauges, split-screen Grad-CAM comparison slider.
- **Backend (`backend/`)**: FastAPI ML microservice serving EfficientNetB0 leaf disease classification, real-time Grad-CAM saliency heatmaps, and RandomForestRegressor agro-climatic harvest forecasts.
- **Trained Artifacts (`models/`)**:
  - `disease_model.keras` (96.6% test accuracy, 62 classes across 20 crop species)
  - `yield_model.joblib` ($R^2 = 0.9022$, trained on 31,621 FAO country-crop observations)
  - `class_names.json` & `feature_schema.json` (real validation schemas)

---

## 🚀 Quick Start (Local Development)

### 1. Backend (FastAPI ML Microservice)
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start the ML Engine (runs on http://127.0.0.1:8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend (Next.js 15 UI)
```bash
# In a second terminal:
cd frontend
npm install
npm run dev
# Web UI opens on http://localhost:3000
```

---

## 📦 Pushing to GitHub

The repository is pre-configured with a comprehensive `.gitignore` preventing large datasets, training images, and temporary caches from entering git history.

Run the following commands in the project root:

```bash
# 1. Stage all application files and model artifacts
git add .

# 2. Commit
git commit -m "feat: initial commit of BioVision Multimodal Agro-AI Engine"

# 3. Create a new repository on GitHub (e.g. 'biovision-agro-ai')
# 4. Link remote and push (replace YOUR_USERNAME and REPO_NAME)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/biovision-agro-ai.git
git push -u origin main
```

---

## ☁️ Deployment Guide

### A. Deploy Frontend on Vercel

1. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your imported GitHub repository (`biovision-agro-ai`).
3. In **Project Settings**:
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Framework Preset**: *Next.js* (auto-detected).
4. In **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL` = Your deployed backend URL (e.g., `https://biovision-api.onrender.com` or your cloud server IP).
5. Click **Deploy**.

> *Note:* If running the frontend on Vercel while keeping the backend local, you can use [ngrok](https://ngrok.com) (`ngrok http 8000`) and set `NEXT_PUBLIC_API_URL` to your ngrok tunnel URL.

---

### B. Deploy Backend on Render / Railway / Docker

The backend includes a production-ready `backend/Dockerfile`, `backend/Procfile`, and `render.yaml`.

#### Option 1: Render (Docker Blueprint)
1. Push your repo to GitHub.
2. In [Render](https://render.com), click **"New"** → **"Blueprint"**.
3. Connect your repository. Render automatically reads `render.yaml` and deploys the FastAPI container with models mounted.

#### Option 2: Railway
1. In [Railway](https://railway.app), click **"New Project"** → **"Deploy from GitHub repo"**.
2. Under Settings, set **Root Directory** to `/` or configure Dockerfile path to `backend/Dockerfile`.
3. Railway will build the container and provide a live public HTTPS URL.
4. Copy this HTTPS URL and paste it into Vercel's `NEXT_PUBLIC_API_URL` environment variable.

---

## 🔬 Dataset & Class Roadmap

- **Active Foliar Pathology (20 Crops • 62 Classes)**:
  Apple, Banana, Blueberry, Cherry, Corn (Maize), Cucumber, Grape, Mango, Orange, Peach, Pepper (Bell), Potato, Raspberry, Rice, Soybean, Squash, Strawberry, Tomato, Watermelon, Wheat.
- **Yield Extension Roadmap (7 Additional Crops)**:
  Barley, Carrots & Turnips, Dates, Papayas, Pears, Pineapples, Spinach.

---

## 📄 License
Academic and Educational Project for SE-314L Artificial Intelligence.
