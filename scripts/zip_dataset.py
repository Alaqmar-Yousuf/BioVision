import zipfile
from pathlib import Path
import os

split_dir = Path(r"D:\University\5th Semester\AI lab\ai project\data\split")
zip_path = Path(r"D:\University\5th Semester\AI lab\ai project\dataset_split.zip")

print("Zipping data/split to dataset_split.zip...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(split_dir):
        for f in files:
            full_path = Path(root) / f
            # Store with relative path e.g. split/train/... or train/...
            rel_path = full_path.relative_to(split_dir.parent)
            zf.write(full_path, rel_path)

size_mb = zip_path.stat().st_size / (1024 * 1024)
print(f"Successfully created {zip_path} ({size_mb:.1f} MB)")
