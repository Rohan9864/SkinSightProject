# Model Weights

The trained model file is not included in this repository
because it exceeds GitHub's 100MB file size limit.

## Model Details

| Property | Value |
|---|---|
| Architecture | ConvNeXt-Base |
| Training dataset | ISIC 2019 |
| Validation accuracy | ~88% |
| Input size | 384×384 |
| Output classes | 8 |
| File name | `convnext_base_90pct.pth` |
| File size | ~330 MB |

## Download Instructions

1. Download `convnext_base_90pct.pth` from
   [Google Drive / Kaggle output — add your link here]

2. Place it in this directory:

3. Restart Django:
```bash
   python manage.py runserver 8000
```

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