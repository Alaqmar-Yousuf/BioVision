"""
Integrate 6 newly downloaded crop datasets into data/split/:
  - Banana (4 classes)
  - Cucumber (2 classes)
  - Mango (8 classes)
  - Rice (3 classes)
  - Watermelon (4 classes)
  - Wheat (3 classes)
Total: 24 new classes + 38 existing classes = 62 total classes!

Images are resized to 224x224 RGB to keep the dataset fast and compact.
Split: 70% Train / 15% Val / 15% Test (Seed 42).
"""

import os
import zipfile
import shutil
from pathlib import Path
from PIL import Image
import numpy as np

PROJECT_ROOT = Path(r"D:\University\5th Semester\AI lab\ai project")
SPLIT_DIR    = PROJECT_ROOT / "data" / "split"
TRAIN_DIR    = SPLIT_DIR / "train"
VAL_DIR      = SPLIT_DIR / "val"
TEST_DIR     = SPLIT_DIR / "test"

SEED = 42
RNG = np.random.default_rng(SEED)
IMG_SIZE = (224, 224)

# Definition of zip mappings: (zip_name, prefix_filter, target_class_name)
MAPPINGS = [
    # ── Banana ──
    ("banana_leaf_ds.zip", "BananaLSD/OriginalSet/cordana", "Banana___Cordana"),
    ("banana_leaf_ds.zip", "BananaLSD/OriginalSet/healthy", "Banana___healthy"),
    ("banana_leaf_ds.zip", "BananaLSD/OriginalSet/pestalotiopsis", "Banana___Pestalotiopsis"),
    ("banana_leaf_ds.zip", "BananaLSD/OriginalSet/sigatoka", "Banana___Sigatoka"),

    # ── Cucumber ──
    ("cucumber_leaf_ds.zip", "Cucumber plant diseases dataset/training/Ill_cucumber", "Cucumber___Diseased"),
    ("cucumber_leaf_ds.zip", "Cucumber plant diseases dataset/testing/Ill_cucumber", "Cucumber___Diseased"),
    ("cucumber_leaf_ds.zip", "Cucumber plant diseases dataset/training/good_Cucumber", "Cucumber___healthy"),
    ("cucumber_leaf_ds.zip", "Cucumber plant diseases dataset/testing/good_Cucumber", "Cucumber___healthy"),

    # ── Mango ──
    ("mango_leaf_ds.zip", "Anthracnose", "Mango___Anthracnose"),
    ("mango_leaf_ds.zip", "Bacterial Canker", "Mango___Bacterial_canker"),
    ("mango_leaf_ds.zip", "Cutting Weevil", "Mango___Cutting_weevil"),
    ("mango_leaf_ds.zip", "Die Back", "Mango___Die_back"),
    ("mango_leaf_ds.zip", "Gall Midge", "Mango___Gall_midge"),
    ("mango_leaf_ds.zip", "Healthy", "Mango___healthy"),
    ("mango_leaf_ds.zip", "Powdery Mildew", "Mango___Powdery_mildew"),
    ("mango_leaf_ds.zip", "Sooty Mould", "Mango___Sooty_mould"),

    # ── Rice ──
    ("rice_leaf_ds.zip", "rice_leaf_diseases/Bacterial leaf blight", "Rice___Bacterial_leaf_blight"),
    ("rice_leaf_ds.zip", "rice_leaf_diseases/Brown spot", "Rice___Brown_spot"),
    ("rice_leaf_ds.zip", "rice_leaf_diseases/Leaf smut", "Rice___Leaf_smut"),

    # ── Watermelon ──
    ("watermelon_leaf_ds.zip", "watermelon___anthracnose", "Watermelon___Anthracnose"),
    ("watermelon_leaf_ds.zip", "watermelon___downy_mildew", "Watermelon___Downy_mildew"),
    ("watermelon_leaf_ds.zip", "watermelon___healthy", "Watermelon___healthy"),
    ("watermelon_leaf_ds.zip", "watermelon___mosaic_virus", "Watermelon___Mosaic_virus"),

    # ── Wheat ──
    ("wheat_leaf_ds.zip", "wheat_leaf/Healthy", "Wheat___healthy"),
    ("wheat_leaf_ds.zip", "wheat_leaf/septoria", "Wheat___Septoria"),
    ("wheat_leaf_ds.zip", "wheat_leaf/stripe_rust", "Wheat___Stripe_rust"),
]

print("1. Scanning images from the 6 zip archives...")
class_images = {}  # target_class -> list of (zip_path, filename_inside_zip)

for zip_name, prefix, target_class in MAPPINGS:
    zip_path = PROJECT_ROOT / zip_name
    if not zip_path.exists():
        print(f"Warning: {zip_path} not found!")
        continue
    
    if target_class not in class_images:
        class_images[target_class] = []
        
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for name in zf.namelist():
            if name.startswith(prefix) and name.lower().endswith(('.jpg', '.jpeg', '.png')):
                class_images[target_class].append((zip_path, name))

print(f"   Collected images for {len(class_images)} distinct new classes:")
for c, img_list in sorted(class_images.items()):
    print(f"     - {c:<32}: {len(img_list):>4} images")

print("\n2. Resizing & splitting into train (70%) / val (15%) / test (15%)...")

for target_class, img_list in class_images.items():
    if not img_list:
        continue
    
    # Shuffle deterministically
    indices = np.arange(len(img_list))
    RNG.shuffle(indices)
    
    n_total = len(img_list)
    n_train = max(1, int(0.70 * n_total))
    n_val   = max(1, int(0.15 * n_total))
    
    splits = {
        TRAIN_DIR / target_class: [img_list[i] for i in indices[:n_train]],
        VAL_DIR   / target_class: [img_list[i] for i in indices[n_train:n_train+n_val]],
        TEST_DIR  / target_class: [img_list[i] for i in indices[n_train+n_val:]],
    }
    
    # Create target directories
    for s_dir, s_imgs in splits.items():
        s_dir.mkdir(parents=True, exist_ok=True)
        # Open zips on-demand and process images
        zip_handles = {}
        for idx, (zp, fname) in enumerate(s_imgs):
            if zp not in zip_handles:
                zip_handles[zp] = zipfile.ZipFile(zp, 'r')
            zf = zip_handles[zp]
            try:
                with zf.open(fname) as f_img:
                    with Image.open(f_img) as img:
                        img_rgb = img.convert('RGB')
                        img_resized = img_rgb.resize(IMG_SIZE, Image.Resampling.BILINEAR)
                        out_path = s_dir / f"img_{idx:05d}.jpg"
                        img_resized.save(out_path, format="JPEG", quality=90)
            except Exception as e:
                pass
        for zh in zip_handles.values():
            zh.close()

print("\n3. Verifying final split directory...")
for part in ["train", "val", "test"]:
    p = SPLIT_DIR / part
    classes = [d.name for d in p.iterdir() if d.is_dir()]
    total_imgs = sum(len(list(d.glob('*.jpg'))) for d in p.iterdir() if d.is_dir())
    print(f"   {part:<6}: {len(classes)} classes, {total_imgs:,} total images")

print("\nIntegration complete!")
