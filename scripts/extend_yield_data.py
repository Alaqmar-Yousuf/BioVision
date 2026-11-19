"""
Extend yield.csv with synthetic-but-realistic data for the 11 Tab-1 crops
that are missing from the FAO yield dataset.

Strategy:
- Reuse the same (Area, Year, rainfall, pesticides, avg_temp) rows already
  in yield.csv (so climate/region context is authentic).
- Apply FAO world-average yield ranges per crop, with realistic variation
  driven by temperature and rainfall.
- Output: data/raw/yield_extended.csv  (original + new rows)
"""

import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)

# ── Load original dataset ─────────────────────────────────────────────────────
CSV_IN  = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\yield.csv")
CSV_OUT = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\yield_extended.csv")

df = pd.read_csv(CSV_IN)
print(f"Original rows: {len(df)}")

# ── FAO-based yield profiles for the 11 missing crops ────────────────────────
# Format: "Item": (base_hg_ha, temp_sensitivity, rain_sensitivity, noise_pct)
#   base_hg_ha      — world average yield in hg/ha
#   temp_coeff      — yield change per °C above 15°C (can be negative = heat stress)
#   rain_coeff      — yield change per 100mm extra rain (hg/ha)
#   noise_pct       — random noise fraction (0.15 = ±15%)
CROP_PROFILES = {
    "Tomatoes":        (370_000,  2_000, 1_200, 0.18),
    "Apples":          (200_000, -1_500,   800, 0.20),
    "Grapes":          (100_000, -2_000, -1_000, 0.22),  # grapes prefer drier
    "Cherries":        (80_000,  -2_500,   600, 0.25),
    "Peaches and nectarines": (100_000, -1_000, 500, 0.22),
    "Oranges":         (220_000,  3_000,  1_000, 0.18),
    "Pepper (Capsicum)": (150_000, 1_500, 800, 0.20),
    "Strawberries":    (280_000,  1_000, 1_500, 0.20),
    "Blueberries":     (90_000,  -500,  2_000, 0.25),
    "Raspberries":     (70_000,  -1_000, 1_500, 0.25),
    "Pumpkins, squash and gourds": (200_000, 2_500, 1_000, 0.18),
}

# ── Build extended rows ───────────────────────────────────────────────────────
# Use unique (Area, Year) combos from the original data for context
climate_ctx = (df
               .drop_duplicates(subset=["Area", "Year"])
               [["Area", "Year", "average_rain_fall_mm_per_year",
                 "pesticides_tonnes", "avg_temp"]]
               .copy())

new_rows = []
for item, (base, t_coef, r_coef, noise) in CROP_PROFILES.items():
    rows = climate_ctx.copy()
    rows["Item"] = item

    t_effect  = (rows["avg_temp"] - 15.0) * t_coef
    r_effect  = ((rows["average_rain_fall_mm_per_year"] - 1000) / 100) * r_coef
    noise_arr = RNG.uniform(-noise, noise, size=len(rows))

    raw_yield = base + t_effect + r_effect
    raw_yield = raw_yield * (1 + noise_arr)
    raw_yield = raw_yield.clip(lower=base * 0.25)   # floor at 25% of base
    rows["hg/ha_yield"] = raw_yield.round().astype(int)

    new_rows.append(rows)
    print(f"  {item:40s} mean={rows['hg/ha_yield'].mean():>10,.0f} hg/ha  rows={len(rows):,}")

extra_df = pd.concat(new_rows, ignore_index=True)

# ── Combine & save ─────────────────────────────────────────────────────────────
combined = pd.concat([df, extra_df], ignore_index=True)
combined = combined.drop(columns=["Unnamed: 0"], errors="ignore")
combined.to_csv(CSV_OUT, index=False)

print(f"\nOriginal rows : {len(df):,}")
print(f"New rows added: {len(extra_df):,}")
print(f"Total rows    : {len(combined):,}")
print(f"All crops     : {sorted(combined['Item'].unique().tolist())}")
print(f"\nSaved to: {CSV_OUT}")
