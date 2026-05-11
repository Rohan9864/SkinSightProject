# Model Training — ConvNeXt-Base on ISIC 2019

This folder contains the Kaggle notebook used to train
the ConvNeXt-Base skin disease classifier.

---

## Training Environment

| Property | Value |
|---|---|
| Platform | Kaggle Notebooks |
| GPU | T4 x1 (single GPU via `CUDA_VISIBLE_DEVICES=0`) |
| Framework | PyTorch + timm |
| Dataset | ISIC 2019 (25,331 dermoscopy images) |
| Training time | ~12-15 hours |
| Notebook file | `convnext_base_90pct.ipynb` |

---

## Final Results

| Metric | Value |
|---|---|
| Architecture | ConvNeXt-Base |
| Pooling | GeM (Generalized Mean Pooling, learned p≈2.80) |
| Image size | 384×384 |
| Best val accuracy | ~88% |
| Total epochs | 130 |
| Optimizer | AdamW (differential LR) |
| Scheduler | Linear warmup (10 epochs) + CosineAnnealingLR |
| Loss | FocalLoss (gamma=2.0, label_smoothing=0.1) |

---

## Architecture Details

```
Input (1, 3, 384, 384)
        ↓
ConvNeXt-Base backbone (timm, pretrained ImageNet)
  → output: (1, 1024, 12, 12)
        ↓
GeM Pooling (p=3, learned → p≈2.80)
  → output: (1, 1024, 1, 1)
        ↓
Flatten → (1, 1024)
        ↓
BatchNorm1d(1024, momentum=0.01)
        ↓
Linear(1024 → 512)
        ↓
SiLU activation
        ↓
Dropout(p=0.5)
        ↓
Linear(512 → 8)
        ↓
Output (1, 8) — raw logits for 8 disease classes
```

---

## Training Configuration

```python
IMAGE_SIZE    = 384
BATCH_SIZE    = 16
NUM_EPOCHS    = 130
WARMUP_EPOCHS = 10
BACKBONE_LR   = 1e-5
HEAD_LR       = 1e-4
MIXUP_ALPHA   = 0.15
MIXUP_START   = 16   # MixUp enabled from epoch 16
SEED          = 42
```

---

## Augmentation Pipeline

**Training:**
- Resize to 444×444 then RandomCrop to 384×384
- RandomHorizontalFlip (p=0.5)
- RandomVerticalFlip (p=0.5)
- RandomRotation up to 90° (p=0.8)
- RandAugment (num_ops=3, magnitude=9)
- ColorJitter (brightness=0.3, contrast=0.3, saturation=0.25, hue=0.1)
- RandomGrayscale (p=0.08)
- RandomAffine (translate=0.10, scale=0.80-1.20, shear=10)
- RandomErasing (p=0.35, scale=0.02-0.15)
- MixUp (alpha=0.15, starts at epoch 16)

**Validation / Test:**
- Resize to 384×384
- Normalize (ImageNet mean/std)

---

## Loss Function — Focal Loss

```python
FocalLoss(
    alpha=class_weights,   # handles class imbalance
    gamma=2.0,             # focuses on hard examples
    label_smoothing=0.1    # prevents overconfidence
)
```

Focal Loss was chosen over CrossEntropyLoss because:
- ISIC 2019 is severely imbalanced (NV: 12,875 vs DF: 239)
- Focal loss down-weights easy examples (majority class)
- Focuses training on hard/rare examples

---

## Optimizer and Scheduler

```python
# Differential learning rates
optimizer = AdamW([
    {'params': backbone_params, 'lr': 1e-5},  # slow — pretrained
    {'params': head_params,     'lr': 1e-4},  # fast — randomly init
], weight_decay=5e-3)

# Warmup + Cosine annealing
scheduler = SequentialLR([
    LinearLR(start_factor=0.02, total_iters=10),  # warmup
    CosineAnnealingLR(T_max=120, eta_min=1e-8),   # annealing
])
```

---

## Class Imbalance Handling

Two complementary strategies used:

1. **WeightedRandomSampler** — rare classes are sampled
   more frequently during training

2. **FocalLoss with class weights** — rare class errors
   are penalized more heavily

---

## Dataset Split

| Split | Size | Percentage |
|---|---|---|
| Train | ~20,264 | 80% |
| Validation | ~2,533 | 10% |
| Test | ~2,534 | 10% |

Stratified split ensures equal class proportions in each set.

---

## Disease Classes

| Index | Code | Full Name |
|---|---|---|
| 0 | MEL | Melanoma |
| 1 | NV | Melanocytic Nevi |
| 2 | BCC | Basal Cell Carcinoma |
| 3 | AK | Actinic Keratosis |
| 4 | BKL | Benign Keratosis |
| 5 | DF | Dermatofibroma |
| 6 | VASC | Vascular Lesion |
| 7 | SCC | Squamous Cell Carcinoma |

---

## How to Retrain

1. Create a Kaggle account at kaggle.com

2. Upload the ISIC 2019 dataset:
   - Download from: https://challenge.isic-archive.com/data/#2019
   - Upload `ISIC_2019_Training_Input/` and CSV to Kaggle dataset

3. Open `convnext_base_90pct.ipynb` in Kaggle

4. Add your dataset and enable GPU T4

5. Run all cells in order (takes ~12-15 hours)

6. Download `convnext_base_90pct.pth` from Output tab

7. Place in `../models/convnext_base_90pct.pth`

8. Restart Django: `python manage.py runserver 8000`

---

## Model File

| Property | Value |
|---|---|
| Filename | `convnext_base_90pct.pth` |
| Size | ~330 MB |
| Location | `../models/convnext_base_90pct.pth` |
| Format | PyTorch state dict |
| Keys | `0.*` = backbone, `1.*` = head |

> The model file is not included in this repository
> (exceeds GitHub's 100MB limit).
> Download separately — see instructions above.