"""
Build an authentic, extended multi-crop yield dataset for BioVision.
Matches FAOSTAT official yields for all 26 crops with country-level climate data
(Rainfall, Temperature, Pesticides) from the World Bank / FAO archive.
"""

import pandas as pd
from pathlib import Path

TARGET_CROPS = [
    'Apples', 'Bananas', 'Barley', 'Blueberries', 'Carrots and turnips', 'Cherries',
    'Chillies and peppers, green (Capsicum spp. and Pimenta spp.)',
    'Cucumbers and gherkins', 'Dates', 'Grapes', 'Maize (corn)',
    'Mangoes, guavas and mangosteens', 'Oranges', 'Papayas', 'Peaches and nectarines',
    'Pears', 'Pineapples', 'Potatoes', 'Pumpkins, squash and gourds', 'Raspberries',
    'Rice', 'Spinach', 'Strawberries', 'Tomatoes', 'Watermelons', 'Wheat'
]

YIELD_CSV = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\yield.csv")
FAO_CSV   = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\faostat_extracted\Production_Crops_Livestock_E_All_Data_(Normalized).csv")
OUT_CSV   = Path(r"D:\University\5th Semester\AI lab\ai project\data\raw\yield_26crops.csv")

print("1. Extracting climate records from yield.csv...")
orig_df = pd.read_csv(YIELD_CSV)
climate_df = (orig_df[['Area', 'Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp']]
              .dropna()
              .drop_duplicates(subset=['Area', 'Year']))
print(f"   Found {len(climate_df):,} distinct (Area, Year) climate records across {climate_df['Area'].nunique()} countries.")

valid_areas = set(climate_df['Area'].unique())
valid_years = set(climate_df['Year'].unique())

print("2. Extracting real FAOSTAT yield data for 26 target crops...")
yield_chunks = []
chunk_size = 250000

for chunk in pd.read_csv(FAO_CSV, chunksize=chunk_size, encoding='latin1', low_memory=False):
    # Filter element == Yield, item in target crops, valid area and year
    mask = (
        (chunk['Element'] == 'Yield') &
        (chunk['Item'].isin(TARGET_CROPS)) &
        (chunk['Area'].isin(valid_areas)) &
        (chunk['Year'].isin(valid_years)) &
        (chunk['Value'].notna()) &
        (chunk['Value'] > 0)
    )
    filtered = chunk[mask][['Area', 'Item', 'Year', 'Value']].copy()
    if len(filtered) > 0:
        yield_chunks.append(filtered)

fao_yield = pd.concat(yield_chunks, ignore_index=True)
print(f"   Extracted {len(fao_yield):,} valid crop-yield observations.")

# Convert FAO kg/ha -> hg/ha (multiply by 10, matching original yield.csv)
fao_yield['hg/ha_yield'] = (fao_yield['Value'] * 10.0).round().astype(int)
fao_yield = fao_yield.drop(columns=['Value'])

print("3. Merging with environmental & climate features...")
merged_df = pd.merge(fao_yield, climate_df, on=['Area', 'Year'], how='inner')
merged_df = merged_df.drop_duplicates(subset=['Area', 'Item', 'Year'])

print(f"   Successfully matched {len(merged_df):,} rows!")
print("\nCrop breakdown in final dataset:")
crop_counts = merged_df['Item'].value_counts()
for crop, cnt in crop_counts.items():
    mean_yield_t = merged_df[merged_df['Item'] == crop]['hg/ha_yield'].mean() / 10000.0
    print(f"  - {crop:<58} : {cnt:>5,} rows (avg {mean_yield_t:.2f} t/ha)")

merged_df.to_csv(OUT_CSV, index=False)
print(f"\nSaved clean 26-crop dataset to: {OUT_CSV}")
