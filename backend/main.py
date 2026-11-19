import base64
import io
import json
import os
import sys
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
import pandas as pd
from PIL import Image
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))
try:
    from backend.gradcam import find_last_conv_layer, make_gradcam_heatmap, overlay_heatmap
except (ImportError, ValueError):
    try:
        from gradcam import find_last_conv_layer, make_gradcam_heatmap, overlay_heatmap
    except ImportError:
        find_last_conv_layer = None
        make_gradcam_heatmap = None
        overlay_heatmap = None

app = FastAPI(title="BioVision Multimodal Agro-AI Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def resolve_dir(dirname):
    local = Path(dirname)
    parent = PROJECT_ROOT / dirname
    return local if local.exists() else parent

MODELS_DIR = resolve_dir("models")
REPORTS_DIR = resolve_dir("reports")

DISEASE_MODEL_PATH = MODELS_DIR / "disease_model.keras"
CLASS_NAMES_PATH   = MODELS_DIR / "class_names.json"
YIELD_MODEL_PATH   = MODELS_DIR / "yield_model.joblib"
SCHEMA_PATH        = MODELS_DIR / "feature_schema.json"

# Load models safely into memory
disease_model, class_names, conv_layer = None, [], None
try:
    from tensorflow import keras
    if DISEASE_MODEL_PATH.exists():
        disease_model = keras.models.load_model(DISEASE_MODEL_PATH)
        class_names = json.loads(CLASS_NAMES_PATH.read_text(encoding="utf-8"))
        if find_last_conv_layer:
            conv_layer = find_last_conv_layer(disease_model)
        print(f"[BioVision API] Loaded Disease Vision Model ({len(class_names)} classes)")
except Exception as e:
    print(f"[BioVision API] Warning: Disease model load failed: {e}")

yield_pipe, feature_schema = None, {}
try:
    if YIELD_MODEL_PATH.exists():
        yield_pipe = joblib.load(YIELD_MODEL_PATH)
        feature_schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        print("[BioVision API] Loaded Yield Forecasting Model Pipeline")
except Exception as e:
    print(f"[BioVision API] Warning: Yield model load failed: {e}")

# Exact real mapping from vision crops to FAO yield items (from app.py)
VISION_TO_YIELD = {
    'apple':      'Apples',
    'banana':     'Bananas',
    'blueberry':  'Blueberries',
    'cherry':     'Cherries',
    'corn':       'Maize (corn)',
    'maize':      'Maize (corn)',
    'cucumber':   'Cucumbers and gherkins',
    'grape':      'Grapes',
    'mango':      'Mangoes, guavas and mangosteens',
    'orange':     'Oranges',
    'peach':      'Peaches and nectarines',
    'pepper':     'Chillies and peppers, green (Capsicum spp. and Pimenta spp.)',
    'potato':     'Potatoes',
    'raspberry':  'Raspberries',
    'rice':       'Rice',
    'squash':     'Pumpkins, squash and gourds',
    'strawberry': 'Strawberries',
    'tomato':     'Tomatoes',
    'watermelon': 'Watermelons',
    'wheat':      'Wheat',
}

class YieldRequest(BaseModel):
    Area: str
    Item: str
    average_rain_fall_mm_per_year: float
    pesticides_tonnes: float
    avg_temp: float

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "disease_model_loaded": disease_model is not None,
        "yield_model_loaded": yield_pipe is not None,
        "classes_count": len(class_names)
    }

@app.get("/api/schema")
def get_schema():
    """Returns the exact training schema with real countries and crops."""
    return feature_schema

@app.get("/api/metrics")
def get_metrics():
    """Returns real empirical evaluation metrics from reports directory."""
    clf_metrics = {}
    clf_path = REPORTS_DIR / "classifier_metrics.json"
    if clf_path.exists():
        clf_metrics = json.loads(clf_path.read_text(encoding="utf-8"))

    yield_metrics = {}
    yield_path = REPORTS_DIR / "yield_metrics.json"
    if yield_path.exists():
        yield_metrics = json.loads(yield_path.read_text(encoding="utf-8"))

    return {
        "classifier": clf_metrics,
        "yield": yield_metrics,
        "has_confusion_matrix": (REPORTS_DIR / "confusion_matrix.png").exists(),
        "has_training_curves": (REPORTS_DIR / "training_curves.png").exists(),
        "has_yield_actual_vs_pred": (REPORTS_DIR / "yield_actual_vs_pred.png").exists(),
        "has_yield_importance": (REPORTS_DIR / "yield_importance.png").exists(),
    }

@app.get("/api/reports/image/{filename}")
def get_report_image(filename: str):
    """Serves the actual generated training and evaluation plots."""
    allowed = {
        "training_curves.png": REPORTS_DIR / "training_curves.png",
        "confusion_matrix.png": REPORTS_DIR / "confusion_matrix.png",
        "yield_actual_vs_pred.png": REPORTS_DIR / "yield_actual_vs_pred.png",
        "yield_importance.png": REPORTS_DIR / "yield_importance.png",
    }
    if filename not in allowed or not allowed[filename].exists():
        raise HTTPException(status_code=404, detail="Report image not found")
    return FileResponse(allowed[filename], media_type="image/png")

@app.post("/api/diagnose")
async def diagnose(file: UploadFile = File(...)):
    """Executes real EfficientNetB0 inference and real Grad-CAM generation."""
    if not disease_model:
        raise HTTPException(status_code=503, detail="Disease classification model not loaded")

    raw_bytes = await file.read()
    image = Image.open(io.BytesIO(raw_bytes)).convert("RGB").resize((224, 224))
    arr = np.array(image, dtype=np.float32)
    batch = np.expand_dims(arr, 0)

    # Real model predict call
    probs = disease_model.predict(batch, verbose=0)[0]
    top_indices = np.argsort(probs)[::-1][:3]

    predictions = []
    for idx in top_indices:
        c_raw = class_names[idx]
        is_healthy = "healthy" in c_raw.lower()
        parts = c_raw.split("___")
        crop_name = parts[0].replace("_", " ") if len(parts) > 1 else "Unknown"
        disease_name = parts[1].replace("_", " ") if len(parts) > 1 else parts[0]
        
        predictions.append({
            "class_name": c_raw.replace("___", " — ").replace("_", " "),
            "raw_name": c_raw,
            "crop": crop_name,
            "disease": disease_name,
            "probability": float(probs[idx]),
            "is_healthy": is_healthy
        })

    # Real Grad-CAM Saliency Map computation
    heatmap_b64 = None
    if make_gradcam_heatmap and overlay_heatmap and conv_layer:
        try:
            heatmap = make_gradcam_heatmap(batch, disease_model, conv_layer, int(top_indices[0]))
            overlay = overlay_heatmap(arr.astype(np.uint8), heatmap)
            buf = io.BytesIO()
            Image.fromarray(overlay).save(buf, format="PNG")
            heatmap_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception as e:
            print(f"Grad-CAM generation error: {e}")

    top = predictions[0]
    
    # Real mapping to FAO crop item for cross-module synthesis
    diag_label_lower = top["raw_name"].lower()
    matched_fao_crop = next((v for k, v in VISION_TO_YIELD.items() if k in diag_label_lower), None)

    return {
        "top_prediction": top,
        "top_3": predictions,
        "gradcam_image": heatmap_b64,
        "matched_fao_crop": matched_fao_crop
    }

@app.post("/api/forecast")
def forecast(req: YieldRequest):
    """Executes real Scikit-Learn pipeline predict call."""
    if not yield_pipe:
        raise HTTPException(status_code=503, detail="Yield model not loaded")

    df = pd.DataFrame([req.dict()])
    pred_hg_ha = float(yield_pipe.predict(df)[0])
    pred_t_ha = pred_hg_ha / 10000.0

    return {
        "predicted_yield_hg_ha": round(pred_hg_ha, 2),
        "predicted_yield_tonnes_ha": round(pred_t_ha, 2),
        "inputs": req.dict()
    }
