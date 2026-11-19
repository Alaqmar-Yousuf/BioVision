import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import streamlit as st
from PIL import Image

st.set_page_config(
    page_title='BioVision - Agro-AI Engine',
    page_icon='🌱',
    layout='wide'
)

DISEASE_MODEL_PATH = Path('models/disease_model.keras')
CLASS_NAMES_PATH   = Path('models/class_names.json')
YIELD_MODEL_PATH   = Path('models/yield_model.joblib')
SCHEMA_PATH        = Path('models/feature_schema.json')
YIELD_METRICS_PATH = Path('reports/yield_metrics.json')

# ── Nicer display labels for every input feature ──────────────────────────────
FEATURE_LABELS = {
    'Area':                           '🌍  Country / Region',
    'Item':                           '🌾  Crop Type',
    'average_rain_fall_mm_per_year':  '🌧️  Annual Rainfall (mm / year)',
    'pesticides_tonnes':              '🧪  Pesticides Used (tonnes)',
    'avg_temp':                       '🌡️  Average Temperature (°C)',
}

# ── Mapping from foliar vision crops to yield-dataset "Item" values ───────────
# Supports all 20 vision crops (14 PlantVillage + 6 newly integrated species)
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

@st.cache_resource
def load_disease_artifacts():
    try:
        from tensorflow import keras
        from gradcam import find_last_conv_layer
        model = keras.models.load_model(DISEASE_MODEL_PATH)
        names = json.loads(CLASS_NAMES_PATH.read_text())
        conv_layer = find_last_conv_layer(model)
        return model, names, conv_layer
    except Exception as e:
        return None, None, str(e)

@st.cache_resource
def load_yield_artifacts():
    try:
        pipe    = joblib.load(YIELD_MODEL_PATH)
        schema  = json.loads(SCHEMA_PATH.read_text())
        metrics = json.loads(YIELD_METRICS_PATH.read_text())
        return pipe, schema, metrics
    except Exception as e:
        return None, None, str(e)

def format_class_name(raw_name):
    return raw_name.replace('___', ' — ').replace('__', ' ').replace('_', ' ')

def get_vision_crops(names):
    """Return sorted unique crop names that the vision model knows."""
    crops = set()
    for n in names:
        prefix = n.split('___')[0]
        pretty = (prefix
                  .replace(',_bell', ' (Bell)')
                  .replace('_(including_sour)', '')
                  .replace('_(maize)', ' (Maize)')
                  .replace('_', ' ')
                  .strip())
        crops.add(pretty)
    return sorted(crops)

def run_diagnosis(image):
    from gradcam import make_gradcam_heatmap, overlay_heatmap
    model, names, layer = load_disease_artifacts()
    if model is None:
        raise RuntimeError("Disease classification model could not be loaded.")
    arr   = np.array(image.convert('RGB').resize((224, 224)), dtype=np.float32)
    batch = np.expand_dims(arr, 0)
    probs = model.predict(batch, verbose=0)[0]
    top_indices = np.argsort(probs)[::-1][:3]
    heatmap  = make_gradcam_heatmap(batch, model, layer, int(top_indices[0]))
    shown_img = arr.astype(np.uint8)
    overlay   = overlay_heatmap(shown_img, heatmap)
    return names, probs, top_indices, shown_img, overlay

# ── Header ────────────────────────────────────────────────────────────────────
st.title('🌱 BioVision')
st.caption('Multimodal Plant Pathology & Yield Forecasting Engine — SE-314L Artificial Intelligence')

tab1, tab2, tab3, tab4 = st.tabs([
    '🔬 Disease Diagnosis (Vision)',
    '📈 Yield Forecast (Tabular)',
    '📋 Integrated Agro-Report',
    '📊 Model Performance & Metrics'
])

# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — Disease Diagnosis
# ══════════════════════════════════════════════════════════════════════════════
with tab1:
    st.subheader('Leaf Pathology Diagnosis & Explainable AI (Grad-CAM)')

    if not DISEASE_MODEL_PATH.exists():
        st.warning(
            '⚠️ Disease classification model not found.\n\n'
            'Train it using `python train_classifier.py` or run the Colab notebook.'
        )
    else:
        # ── Supported crops & roadmap info panel ──────────────────────────────
        _, names_tmp, _ = load_disease_artifacts()
        if names_tmp:
            vision_crops = get_vision_crops(names_tmp)
            with st.expander(f'📋 Supported Species & 26-Crop Vision Roadmap — click to expand', expanded=False):
                st.markdown('#### ✅ Active Leaf Pathology Diagnostics (Current Vision Model)')
                st.caption(
                    'Upload a **clear, single-leaf photo** of any of the active crops below. '
                    'The EfficientNetB0 model will classify pathology (or confirm healthy foliage) and generate Grad-CAM heatmaps.'
                )
                cols_c = st.columns(4)
                crop_icons = {
                    'Apple': '🍏', 'Banana': '🍌', 'Blueberry': '🫐', 'Cherry': '🍒',
                    'Corn  Maize ': '🌽', 'Corn': '🌽', 'Cucumber': '🥒', 'Grape': '🍇',
                    'Mango': '🥭', 'Orange': '🍊', 'Peach': '🍑', 'Pepper  Bell ': '🫑',
                    'Pepper': '🫑', 'Potato': '🥔', 'Raspberry': '🍇', 'Rice': '🍚',
                    'Soybean': '🌱', 'Squash': '🎃', 'Strawberry': '🍓',
                    'Tomato': '🍅', 'Watermelon': '🍉', 'Wheat': '🌾',
                }
                for idx, crop in enumerate(vision_crops):
                    icon = next((v for k, v in crop_icons.items() if k.lower() in crop.lower()), '🌿')
                    cols_c[idx % 4].markdown(f'{icon} **{crop}**')

                st.markdown('---')
                st.markdown('#### 🔮 Planned Vision Extensions (Roadmap — Yield-Enabled in Tab 2)')
                st.caption(
                    'These crops are **already fully integrated into Tab 2 Yield Forecasting (FAO benchmark data)**. '
                    'Foliar disease vision classification will be enabled in upcoming expansion phases as multi-pathogen image datasets are finalized:'
                )

                all_fao_crops_spec = [
                    ('Apples', '🍏', 'apple'),
                    ('Bananas', '🍌', 'banana'),
                    ('Barley', '🌾', 'barley'),
                    ('Blueberries', '🫐', 'blueberry'),
                    ('Carrots and turnips', '🥕', 'carrot'),
                    ('Cherries', '🍒', 'cherry'),
                    ('Chillies and peppers, green (Capsicum spp. and Pimenta spp.)', '🫑', 'pepper'),
                    ('Cucumbers and gherkins', '🥒', 'cucumber'),
                    ('Dates', '🌴', 'date'),
                    ('Grapes', '🍇', 'grape'),
                    ('Maize (corn)', '🌽', 'corn'),
                    ('Mangoes, guavas and mangosteens', '🥭', 'mango'),
                    ('Oranges', '🍊', 'orange'),
                    ('Papayas', '🍈', 'papaya'),
                    ('Peaches and nectarines', '🍑', 'peach'),
                    ('Pears', '🍐', 'pear'),
                    ('Pineapples', '🍍', 'pineapple'),
                    ('Potatoes', '🥔', 'potato'),
                    ('Pumpkins, squash and gourds', '🎃', 'squash'),
                    ('Raspberries', '🍇', 'raspberry'),
                    ('Rice', '🍚', 'rice'),
                    ('Spinach', '🥬', 'spinach'),
                    ('Strawberries', '🍓', 'strawberry'),
                    ('Tomatoes', '🍅', 'tomato'),
                    ('Watermelons', '🍉', 'watermelon'),
                    ('Wheat', '🌾', 'wheat'),
                ]

                # Filter out any crop already present in the active vision model
                future_unadded = []
                vision_prefixes = [vc.lower() for vc in vision_crops]
                for fc_name, fc_icon, kw in all_fao_crops_spec:
                    if not any(kw in vp for vp in vision_prefixes):
                        future_unadded.append((fc_name, fc_icon))

                cols_f = st.columns(4)
                for f_idx, (f_name, f_icon) in enumerate(future_unadded):
                    cols_f[f_idx % 4].markdown(f'{f_icon} **{f_name}**  \n`Yield Active • Vision Next`')

        # ── Upload & diagnose ─────────────────────────────────────────────────
        upload = st.file_uploader(
            'Upload a clear photo of a single leaf:',
            type=['jpg', 'jpeg', 'png']
        )
        if upload is not None:
            if ('last_upload_name' not in st.session_state or
                    st.session_state['last_upload_name'] != upload.name):
                with st.spinner('Analyzing leaf pathology with EfficientNetB0 & Grad-CAM…'):
                    img = Image.open(upload)
                    names, probs, top_idx, shown, overlay = run_diagnosis(img)
                    st.session_state['last_upload_name'] = upload.name
                    st.session_state['diag_cache'] = (names, probs, top_idx, shown, overlay)
            else:
                names, probs, top_idx, shown, overlay = st.session_state['diag_cache']

            raw_top   = names[int(top_idx[0])]
            top_label = format_class_name(raw_top)
            top_conf  = float(probs[top_idx[0]])
            is_healthy = 'healthy' in raw_top.lower()

            st.session_state['diagnosis'] = {
                'label':     top_label,
                'raw':       raw_top,
                'confidence': top_conf,
                'healthy':   is_healthy
            }

            col1, col2 = st.columns(2)
            with col1:
                st.image(shown, caption='Preprocessed Leaf Image (224 × 224)', use_container_width=True)
            with col2:
                st.image(overlay, caption='Grad-CAM Heatmap — Red = High Disease Activation', use_container_width=True)

            if is_healthy:
                st.success(f'✅  **Diagnosis: {top_label}** — Confidence: {top_conf*100:.1f}%')
            else:
                st.error(f'🔴  **Pathology Detected: {top_label}** — Confidence: {top_conf*100:.1f}%')

            if top_conf < 0.60:
                st.warning(
                    '⚠️ Low confidence (< 60%). For better results, use a photo of a **single leaf** '
                    'with good lighting and no cluttered background.'
                )

            st.markdown('#### Top-3 Differential Predictions')
            for idx in top_idx:
                c_name = format_class_name(names[int(idx)])
                c_prob = float(probs[idx])
                st.write(f'**{c_name}** — {c_prob*100:.2f}%')
                st.progress(c_prob)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — Yield Forecast
# ══════════════════════════════════════════════════════════════════════════════
with tab2:
    st.subheader('Environmental & Agrochemical Yield Forecasting')

    if not YIELD_MODEL_PATH.exists() or not SCHEMA_PATH.exists():
        st.warning(
            '⚠️ Yield prediction model not found.\n\n'
            'Please run `python train_yield.py` to generate it.'
        )
    else:
        pipe, schema, ymet = load_yield_artifacts()
        diag = st.session_state.get('diagnosis')

        # ── Hint banner if Tab 1 was used ────────────────────────────────────
        if diag:
            diag_l = diag['label'].lower()
            matched_yield_crop = next(
                (v for k, v in VISION_TO_YIELD.items() if k in diag_l), None
            )
            if matched_yield_crop:
                st.info(
                    f"💡 You diagnosed a **{diag['label']}** leaf in Tab 1. "
                    f"**{matched_yield_crop}** has been pre-selected below for a synchronized Tab 3 report."
                )
            else:
                st.info(
                    f"💡 Leaf diagnosed in Tab 1: **{diag['label']}**. "
                    "Select the matching crop below if you want a synchronized Tab 3 report."
                )

        st.markdown("Set your field's environmental and crop conditions using the controls below:")
        st.markdown('---')

        cols = st.columns(3)
        input_values = {}

        for i, (feat_name, spec) in enumerate(schema.items()):
            label = FEATURE_LABELS.get(feat_name, feat_name.replace('_', ' ').title())

            with cols[i % 3]:
                if spec['type'] == 'numeric' and spec['min'] < spec['max']:
                    # ── Numeric slider with nice step sizes ──────────────────
                    rng  = spec['max'] - spec['min']
                    step = 1.0 if rng > 100 else 0.1
                    input_values[feat_name] = st.slider(
                        label,
                        min_value=float(spec['min']),
                        max_value=float(spec['max']),
                        value=float(spec['median']),
                        step=step,
                        help=f"Dataset range: {spec['min']:.1f} – {spec['max']:.1f}"
                    )

                elif spec['type'] == 'numeric':
                    input_values[feat_name] = st.number_input(
                        label, value=float(spec['min'])
                    )

                else:
                    # ── Categorical dropdown ─────────────────────────────────
                    options = spec['options']

                    # Smart default from Tab 1 diagnosis
                    default_idx = 0
                    if diag and feat_name == 'Item':
                        diag_l = diag['label'].lower()
                        for k, v in VISION_TO_YIELD.items():
                            if k in diag_l and v in options:
                                default_idx = options.index(v)
                                break

                    input_values[feat_name] = st.selectbox(
                        label,
                        options,
                        index=default_idx
                    )

        st.markdown('---')
        if st.button('🚜  Forecast Crop Yield', use_container_width=True):
            input_df   = pd.DataFrame([input_values])
            pred_yield = float(pipe.predict(input_df)[0])
            st.session_state['yield'] = {
                'value':  pred_yield,
                'target': ymet['target'],
                'inputs': input_values
            }

        if 'yield' in st.session_state:
            yv = st.session_state['yield']
            tonnes = yv['value'] / 10000.0
            crop_name = yv['inputs'].get('Item', 'Crop')

            st.markdown(f'### 🌾 Predicted Yield — {crop_name}')
            m1, m2 = st.columns(2)
            m1.metric('Hectograms per Hectare (hg/ha)', f"{yv['value']:,.0f}")
            m2.metric('Equivalent in Tonnes / Hectare',  f"{tonnes:.2f} t/ha")

            st.caption(
                f"Algorithm: **{ymet['best_model']}** &nbsp;|&nbsp; "
                f"Test R²: **{ymet['test_r2']:.3f}** &nbsp;|&nbsp; "
                f"Test MAE: **{ymet['test_mae']:,.0f} hg/ha** (≈ {ymet['test_mae']/10000:.2f} t/ha)"
            )

# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — Integrated Agro-Report
# ══════════════════════════════════════════════════════════════════════════════
with tab3:
    st.subheader('Integrated Agro-Pathology & Yield Synthesis')
    diag   = st.session_state.get('diagnosis')
    y_data = st.session_state.get('yield')

    if diag is None or y_data is None:
        st.info('ℹ️ Please complete **Disease Diagnosis** (Tab 1) and **Yield Forecast** (Tab 2) first.')
    else:
        diag_label_lower = diag['label'].lower()
        selected_crop = str(y_data['inputs'].get('Item', ''))

        # Find matching FAO crop from diagnosed plant
        matched_expected_crop = next((v for k, v in VISION_TO_YIELD.items() if k in diag_label_lower), None)
        diag_crop = next((k.capitalize() for k in VISION_TO_YIELD.keys() if k in diag_label_lower), 'Unknown')

        crop_matches = (matched_expected_crop is not None and matched_expected_crop == selected_crop)

        col_a, col_b = st.columns(2)
        baseline_tonnes = y_data['value'] / 10000.0
        with col_a:
            st.metric('Foliar Pathology', diag['label'], f"{diag['confidence']*100:.1f}% confidence")
        with col_b:
            st.metric(f'Potential Yield — {selected_crop}',
                      f"{y_data['value']:,.0f} hg/ha",
                      f"≈ {baseline_tonnes:.2f} t/ha")

        st.divider()

        if crop_matches:
            st.success(f'✅ **Synchronized**: Both modules evaluate **{selected_crop}**. '
                       'Disease severity directly scales your harvest.')
            if diag['healthy']:
                penalty_pct, advice = 0.0, 'Foliage is healthy. No yield reduction expected from disease.'
            elif 'early' in diag_label_lower or 'spot' in diag_label_lower:
                penalty_pct, advice = 0.20, 'Moderate lesions detected — estimated 20% yield loss without treatment.'
            else:
                penalty_pct, advice = 0.50, 'Severe blight/infection — estimated 50% yield loss. Immediate fungicide recommended.'

            adjusted = y_data['value'] * (1.0 - penalty_pct)
            adj_t    = adjusted / 10000.0

            st.markdown('### Realizable Harvest Forecast')
            st.metric(
                f'Net Adjusted Yield — {selected_crop}',
                f"{adjusted:,.0f} hg/ha  (≈ {adj_t:.2f} t/ha)",
                delta=f"-{penalty_pct*100:.0f}% pathology penalty" if penalty_pct > 0 else "0% — Healthy",
                delta_color='inverse'
            )
            st.info(f'**Agronomic Guidance:** {advice}')

            report_lines = [
                '==================================================',
                '      BIOVISION SYNCHRONIZED CROP REPORT          ',
                '==================================================',
                f'Crop Evaluated:       {selected_crop}  (Matched)',
                f'Foliar Diagnosis:     {diag["label"]}',
                f'Confidence:           {diag["confidence"]*100:.2f}%',
                f'Health Status:        {"Healthy" if diag["healthy"] else "Infected"}',
                '--------------------------------------------------',
                f'Potential Yield:      {y_data["value"]:,.0f} hg/ha  (≈ {baseline_tonnes:.2f} t/ha)',
                f'Pathology Penalty:    {penalty_pct*100:.1f}%',
                f'Net Adjusted Yield:   {adjusted:,.0f} hg/ha  (≈ {adj_t:.2f} t/ha)',
                '--------------------------------------------------',
                f'Field Conditions:     {json.dumps(y_data["inputs"], indent=2)}',
                f'Guidance:             {advice}',
                '=================================================='
            ]
        else:
            st.warning(
                f'⚠️ **Crop Mismatch**: Tab 1 diagnosed a **{diag_crop}** leaf, '
                f'but Tab 2 is forecasting **{selected_crop}**.\n\n'
                f'Plant diseases are host-specific — a {diag_crop} pathogen cannot infect {selected_crop}. '
                f'No cross-species penalty is applied. '
                f'Go back to Tab 2 and select a matching crop to get a synchronized report.'
            )
            st.markdown('### Independent Field Readings')
            st.write(f'**{diag_crop} Foliar Status:** {diag["label"]} ({diag["confidence"]*100:.1f}% confidence)')
            st.write(f'**{selected_crop} Expected Yield:** {y_data["value"]:,.0f} hg/ha (≈ {baseline_tonnes:.2f} t/ha)')

            report_lines = [
                '==================================================',
                '      BIOVISION INDEPENDENT FIELD REPORT          ',
                '==================================================',
                f'Diagnosed Leaf:  {diag["label"]}  ({diag["confidence"]*100:.2f}%)',
                f'Forecasted Crop: {selected_crop}',
                f'Notice:          Crop mismatch ({diag_crop} vs {selected_crop}). No penalty applied.',
                f'Yield Forecast:  {y_data["value"]:,.0f} hg/ha  (≈ {baseline_tonnes:.2f} t/ha)',
                f'Field Conditions:{json.dumps(y_data["inputs"], indent=2)}',
                '=================================================='
            ]

        st.download_button(
            label='📥  Download Inspection Report',
            data='\n'.join(report_lines),
            file_name='biovision_agro_report.txt',
            mime='text/plain',
            use_container_width=True
        )

# ══════════════════════════════════════════════════════════════════════════════
# TAB 4 — Model Performance
# ══════════════════════════════════════════════════════════════════════════════
with tab4:
    st.subheader('Model Performance, Evaluation Curves & Feature Importance')

    c_col1, c_col2 = st.columns(2)
    with c_col1:
        st.markdown('#### 🔬 Disease Classifier (EfficientNetB0)')
        clf_metrics_path = Path('reports/classifier_metrics.json')
        if clf_metrics_path.exists():
            m = json.loads(clf_metrics_path.read_text())
            mc1, mc2 = st.columns(2)
            mc1.metric('Test Accuracy', f"{m.get('test_accuracy', 0)*100:.1f}%")
            mc2.metric('Macro F1 Score', f"{m.get('macro_f1', 0)*100:.1f}%")
            st.caption(f"Classes: **{m.get('n_classes')}** | Test images: **{m.get('n_test_images')}**")
        else:
            st.info('Train the classifier to view metrics.')

        for path, caption in [
            ('reports/training_curves.png',  'EfficientNetB0 Training & Validation Accuracy Curves'),
            ('reports/confusion_matrix.png', 'Test Set Confusion Matrix (per-class breakdown)'),
        ]:
            if Path(path).exists():
                st.image(path, caption=caption, use_container_width=True)

    with c_col2:
        st.markdown('#### 📈 Yield Regressor (Random Forest)')
        y_metrics_path = Path('reports/yield_metrics.json')
        if y_metrics_path.exists():
            ym = json.loads(y_metrics_path.read_text())
            my1, my2 = st.columns(2)
            my1.metric('Test R²', f"{ym.get('test_r2', 0):.4f}")
            my2.metric('Test MAE (hg/ha)', f"{ym.get('test_mae', 0):,.0f}")
            st.caption(
                f"Algorithm: **{ym.get('best_model')}** | "
                f"Training rows: **{ym.get('n_rows'):,}** | "
                f"Features: Area, Crop, Rainfall, Pesticides, Temp"
            )
        else:
            st.info('Train the yield model to view metrics.')

        for path, caption in [
            ('reports/yield_actual_vs_pred.png', 'Actual vs Predicted Yield (Test Set)'),
            ('reports/yield_importance.png',     'Permutation Feature Importance'),
        ]:
            if Path(path).exists():
                st.image(path, caption=caption, use_container_width=True)
