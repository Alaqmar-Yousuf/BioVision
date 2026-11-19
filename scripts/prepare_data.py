import random
import shutil
from pathlib import Path
from sklearn.model_selection import train_test_split

RAW = Path('data/raw/plantvillage')
OUT = Path('data/split')

INCLUDE = []                             # [] = Include all 38 classes across all 14 crops
MAX_PER_CLASS = 600                      # Balances class distribution and speeds up training
SEED = 42

def main():
    if OUT.exists():
        shutil.rmtree(OUT, ignore_errors=True)
    
    classes = sorted(p for p in RAW.iterdir() if p.is_dir())
    print(f"Total raw classes detected: {len(classes)}")
    
    selected_count = 0
    for cls_dir in classes:
        if INCLUDE and not any(cls_dir.name.startswith(c) for c in INCLUDE):
            continue
        
        files = sorted(f for f in cls_dir.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png'))
        if not files:
            continue
            
        random.Random(SEED).shuffle(files)
        if MAX_PER_CLASS and len(files) > MAX_PER_CLASS:
            files = files[:MAX_PER_CLASS]
            
        train, rest = train_test_split(files, test_size=0.30, random_state=SEED)
        val, test = train_test_split(rest, test_size=0.50, random_state=SEED)
        
        for split, items in (('train', train), ('val', val), ('test', test)):
            dest = OUT / split / cls_dir.name
            dest.mkdir(parents=True, exist_ok=True)
            for f in items:
                shutil.copy2(f, dest / f.name)
                
        print(f"Class: {cls_dir.name:<45} Train: {len(train):>4} | Val: {len(val):>4} | Test: {len(test):>4}")
        selected_count += 1
        
    print(f"\nDone! Successfully processed and split {selected_count} classes into {OUT}")

if __name__ == '__main__':
    main()
