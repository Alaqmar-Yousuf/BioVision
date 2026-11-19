import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from tensorflow import keras
from tensorflow.keras import layers

DATA = 'data/split'
IMG = (224, 224)
BATCH = 32         # CHANGE: use 16 if memory is constrained
EPOCHS_HEAD = 5    # Set 1 for smoke test, 5 for full training
EPOCHS_FINE = 8    # Set 1 for smoke test, 8 for full training
AUTOTUNE = tf.data.AUTOTUNE

keras.utils.set_random_seed(42)
Path('models').mkdir(exist_ok=True)
Path('reports').mkdir(exist_ok=True)

def load(split, shuffle):
    return keras.utils.image_dataset_from_directory(
        f"{DATA}/{split}",
        image_size=IMG,
        batch_size=BATCH,
        shuffle=shuffle,
        seed=42
    )

print("Loading training, validation, and test datasets...")
train_raw = load('train', True)
class_names = train_raw.class_names
val_ds = load('val', False).prefetch(AUTOTUNE)
test_ds = load('test', False).prefetch(AUTOTUNE)

print(f"Loaded {len(class_names)} classes: {class_names}")

# Data augmentation pipeline
augment = keras.Sequential([
    layers.RandomFlip('horizontal_and_vertical'),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
    layers.RandomContrast(0.1),
])

train_ds = train_raw.map(
    lambda x, y: (augment(x, training=True), y),
    num_parallel_calls=AUTOTUNE
).prefetch(AUTOTUNE)

# EfficientNetB0 backbone (Transfer Learning)
base = keras.applications.EfficientNetB0(
    include_top=False, weights='imagenet', input_shape=IMG + (3,)
)
base.trainable = False

x = layers.GlobalAveragePooling2D()(base.output)
x = layers.Dropout(0.3)(x)
out = layers.Dense(len(class_names), activation='softmax')(x)
model = keras.Model(base.input, out)
model.summary()

cbs = [
    keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
    keras.callbacks.ReduceLROnPlateau(factor=0.3, patience=1)
]

# Phase 1: train classification head only
print("\n--- Phase 1: Training Classification Head ---")
model.compile(
    optimizer=keras.optimizers.Adam(1e-3),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
h1 = model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_HEAD, callbacks=cbs)

# Phase 2: fine-tune top 30 layers
print("\n--- Phase 2: Fine-Tuning Top 30 Layers ---")
for layer in base.layers[-30:]:
    if not isinstance(layer, layers.BatchNormalization):
        layer.trainable = True

model.compile(
    optimizer=keras.optimizers.Adam(1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
h2 = model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_FINE, callbacks=cbs)

# Plot training and validation curves
acc = h1.history['accuracy'] + h2.history['accuracy']
val = h1.history['val_accuracy'] + h2.history['val_accuracy']
plt.figure(figsize=(7, 4))
plt.plot(acc, label='Train Accuracy', color='#1f77b4', lw=2)
plt.plot(val, label='Validation Accuracy', color='#ff7f0e', lw=2)
plt.axvline(len(h1.history['accuracy']) - 1, linestyle='--', color='gray', label='Phase 2 (Fine-tuning)')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.title('EfficientNetB0 Pathology Classifier Learning Curves')
plt.legend()
plt.tight_layout()
plt.savefig('reports/training_curves.png', dpi=150)
plt.close()

# Evaluate on held-out test set
print("\n--- Evaluating Model on Test Set ---")
y_true = np.concatenate([y.numpy() for _, y in test_ds])
y_pred = np.argmax(model.predict(test_ds, verbose=0), axis=1)

report_text = classification_report(y_true, y_pred, target_names=class_names, digits=3)
Path('reports/classification_report.txt').write_text(report_text)
print("\nClassification Report:\n", report_text)

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
size = max(7, len(class_names) * 0.55)
plt.figure(figsize=(size, size))
sns.heatmap(cm, annot=len(class_names) <= 15, fmt='d', cmap='Blues',
            xticklabels=class_names, yticklabels=class_names)
plt.xlabel('Predicted Class')
plt.ylabel('Actual Class')
plt.title('Test Set Confusion Matrix')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('reports/confusion_matrix.png', dpi=150)
plt.close()

metrics = {
    'test_accuracy': float((y_true == y_pred).mean()),
    'macro_f1': float(f1_score(y_true, y_pred, average='macro')),
    'n_classes': len(class_names),
    'n_test_images': int(len(y_true)),
}
Path('reports/classifier_metrics.json').write_text(json.dumps(metrics, indent=2))
print("Classifier Metrics:", metrics)

# Save the trained model and class names
model.save('models/disease_model.keras')
Path('models/class_names.json').write_text(json.dumps(class_names, indent=2))
print('\nSuccessfully saved disease model to models/disease_model.keras!')
