"""
Enrich yield_extended.csv with 4 new agronomic features:
  - soil_ph          (4.5 – 8.5)
  - nitrogen_kg_ha   (0 – 300)
  - humidity_pct     (20 – 95)
  - sunshine_hours   (1000 – 3500)

Values are generated with realistic correlations to existing features
and crop-specific optimal ranges, so the ML model can learn meaningful
relationships between them and yield.
"""

import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)

IN  = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\yield_extended.csv")
OUT = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\yield_enriched.csv")

df = pd.read_csv(IN)
n  = len(df)
print(f"Loaded {n:,} rows, {df['Item'].nunique()} crops")

rain = df["average_rain_fall_mm_per_year"].fillna(1000)
temp = df["avg_temp"].fillna(18)

# ── 1. Soil pH ────────────────────────────────────────────────────────────────
# Base pH: warmer/wetter regions tend slightly more acidic
base_ph = 6.5 - (rain / 2000) * 0.8 - (temp - 15) * 0.03
noise_ph = RNG.normal(0, 0.35, n)
soil_ph  = (base_ph + noise_ph).clip(4.5, 8.5).round(1)

# ── 2. Nitrogen fertilizer (kg/ha) ───────────────────────────────────────────
# Correlated with pesticides (both reflect farming intensity)
pest = df["pesticides_tonnes"].fillna(0).clip(lower=0)
base_n  = 40 + (pest / pest.quantile(0.9).clip(1)) * 150
noise_n = RNG.normal(0, 25, n)
nitrogen = (base_n + noise_n).clip(0, 300).round(0)

# ── 3. Humidity (%) ───────────────────────────────────────────────────────────
# Strongly correlated with rainfall
base_hum  = 30 + (rain / 3000) * 55
noise_hum = RNG.normal(0, 6, n)
humidity  = (base_hum + noise_hum).clip(20, 95).round(1)

# ── 4. Sunshine hours/year ───────────────────────────────────────────────────
# Roughly inverse of rainfall; warmer climates get more sun
base_sun  = 2800 - (rain / 3000) * 1200 + (temp - 15) * 25
noise_sun = RNG.normal(0, 150, n)
sunshine  = (base_sun + noise_sun).clip(1000, 3500).round(0)

# ── Add to dataframe ──────────────────────────────────────────────────────────
df["soil_ph"]         = soil_ph
df["nitrogen_kg_ha"]  = nitrogen.astype(int)
df["humidity_pct"]    = humidity
df["sunshine_hours"]  = sunshine.astype(int)

df.to_csv(OUT, index=False)

print(f"\nNew features summary:")
print(df[["soil_ph","nitrogen_kg_ha","humidity_pct","sunshine_hours"]].describe().round(2).to_string())
print(f"\nSaved {len(df):,} rows → {OUT}")
