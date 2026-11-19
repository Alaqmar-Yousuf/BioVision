import json
import os
import tempfile
from pathlib import Path
os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()

import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

CSV_PATH = 'data/raw/yield_26crops.csv'
TARGET = 'hg/ha_yield'
DROP_COLS = ['Unnamed: 0', 'Year']  # Timeless, climate-driven prediction
SEED = 42

Path('models').mkdir(exist_ok=True)
Path('reports').mkdir(exist_ok=True)

print(f"Loading yield dataset from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH).drop(columns=DROP_COLS, errors='ignore').drop_duplicates()
df = df.dropna(subset=[TARGET])
print(f"Dataset shape after cleaning: {df.shape}")
print(f"Number of distinct crops: {df['Item'].nunique()}")

X, y = df.drop(columns=[TARGET]).copy(), df[TARGET]

num_cols = X.select_dtypes(include='number').columns.tolist()
cat_cols = [c for c in X.columns if c not in num_cols]
if cat_cols:
    X[cat_cols] = X[cat_cols].astype(str)

print(f"Numerical features: {num_cols}")
print(f"Categorical features: {cat_cols}")

pre = ColumnTransformer([
    ('num', SimpleImputer(strategy='median'), num_cols),
    ('cat', Pipeline([
        ('imp', SimpleImputer(strategy='most_frequent')),
        ('ohe', OneHotEncoder(handle_unknown='ignore'))
    ]), cat_cols),
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=SEED
)

print(f"Training set: {len(X_train):,} rows | Test set: {len(X_test):,} rows")
print("\nTraining Random Forest Regressor (100 estimators, max_depth=25)...")

reg = RandomForestRegressor(
    n_estimators=100,
    max_depth=25,
    min_samples_leaf=2,
    random_state=SEED,
    n_jobs=-1
)
best = Pipeline([('pre', pre), ('model', reg)])
best.fit(X_train, y_train)

# Test set evaluation
pred = best.predict(X_test)
mae = float(mean_absolute_error(y_test, pred))
rmse = float(mean_squared_error(y_test, pred) ** 0.5)
r2 = float(r2_score(y_test, pred))

metrics = {
    'target': TARGET,
    'best_model': 'RandomForestRegressor',
    'n_rows': int(len(df)),
    'n_crops': int(df['Item'].nunique()),
    'test_mae': mae,
    'test_rmse': rmse,
    'test_r2': r2,
    'target_min': float(y.min()),
    'target_max': float(y.max()),
}

print("\n" + "="*50)
print(f"Test R2 Score  : {r2:.4f}")
print(f"Test MAE       : {mae:,.0f} hg/ha  (≈ {mae/10000:.2f} tonnes/ha)")
print(f"Test RMSE      : {rmse:,.0f} hg/ha (≈ {rmse/10000:.2f} tonnes/ha)")
print("="*50)

# Plot Actual vs Predicted
print("\nGenerating actual vs predicted evaluation plot...")
plt.figure(figsize=(6, 6))
plt.scatter(y_test, pred, alpha=0.25, color='#2e7d32', edgecolors='none', s=16)
lims = [min(y_test.min(), pred.min()), max(y_test.max(), pred.max())]
plt.plot(lims, lims, 'r--', lw=2, label='Ideal 1:1 Line')
plt.xlabel('Actual Yield (hg/ha)')
plt.ylabel('Predicted Yield (hg/ha)')
plt.title('Actual vs Predicted Yield — 26 Crops (Random Forest)')
plt.legend()
plt.tight_layout()
plt.savefig('reports/yield_actual_vs_pred.png', dpi=150)
plt.close()

# Feature Importance
print("Computing permutation feature importance...")
imp = permutation_importance(best, X_test, y_test, n_repeats=5, random_state=SEED, scoring='r2', n_jobs=-1)
order = np.argsort(imp.importances_mean)
plt.figure(figsize=(8, 5))
plt.barh(np.array(X.columns)[order], imp.importances_mean[order], color='#2e7d32')
plt.xlabel('Drop in R2 score when feature is permuted')
plt.title('Permutation Feature Importance (Yield Predictor — 26 Crops)')
plt.tight_layout()
plt.savefig('reports/yield_importance.png', dpi=150)
plt.close()

# Export feature schema for dynamic Streamlit input generation
schema = {}
for c in X.columns:
    if c in num_cols:
        schema[c] = {
            'type': 'numeric',
            'min': float(X[c].min()),
            'max': float(X[c].max()),
            'median': float(X[c].median())
        }
    else:
        schema[c] = {
            'type': 'categorical',
            'options': sorted(X[c].dropna().unique().tolist())
        }

joblib.dump(best, 'models/yield_model.joblib')
Path('models/feature_schema.json').write_text(json.dumps(schema, indent=2))
Path('reports/yield_metrics.json').write_text(json.dumps(metrics, indent=2))
print('\nSuccessfully saved yield model, feature schema, and evaluation reports!')
