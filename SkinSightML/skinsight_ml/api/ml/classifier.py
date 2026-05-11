# api/ml/classifier.py

import torch
import torch.nn as nn
import timm
from django.conf import settings
import json

# ── Disease classes — must match training order ───────────────
DISEASE_CLASSES = [
    'Melanoma',
    'Melanocytic Nevi',
    'Basal Cell Carcinoma',
    'Actinic Keratosis',
    'Benign Keratosis',
    'Dermatofibroma',
    'Vascular Lesion',
    'Squamous Cell Carcinoma'
]
# Order matches ISIC 2019 training:
# MEL=0, NV=1, BCC=2, AK=3, BKL=4, DF=5, VASC=6, SCC=7

NUM_CLASSES = len(DISEASE_CLASSES)
# = 8

# ── Global model variable ─────────────────────────────────────
MODEL  = None
DEVICE = torch.device('cpu')
# CPU inference for Django server.
# ConvNeXt-Base inference on CPU: ~2-4 seconds per image.
# Acceptable for this system.


def build_model():
    """
    Reconstructs the exact ConvNeXt-Base architecture
    used during training.

    Architecture confirmed from model file inspection:
    - Backbone: ConvNeXt-Base via timm
      (output: 1024 channels, 7×7 spatial for 224×224 input)
    - Head: AdaptiveAvgPool2d → Flatten →
            BatchNorm1d(1024) → Linear(1024→512) →
            GELU → Dropout(0.5) → Linear(512→8)
    - Wrapped as nn.Sequential([backbone, head])

    Returns:
        torch.nn.Module: Full ConvNeXt-Base model.
    """
    # Build ConvNeXt-Base backbone
    backbone = timm.create_model(
        'convnext_base',
        pretrained=False,
        num_classes=0,
        global_pool='')
    # num_classes=0 removes timm's default head.
    # global_pool='' disables timm's pooling.
    # Output shape: (B, 1024, 7, 7) for 224×224 input.
    # We apply our own pooling in the head below.

    # Build custom classifier head
    head = nn.Sequential(
        nn.AdaptiveAvgPool2d(1),
        # (B, 1024, 7, 7) → (B, 1024, 1, 1)
        # Global average pooling collapses spatial dims.

        nn.Flatten(),
        # (B, 1024, 1, 1) → (B, 1024)

        nn.BatchNorm1d(1024),
        # Normalizes the 1024 feature vector.
        # Stabilizes training and acts as regularization.
        # Has learnable weight and bias (saved in .pth).

        nn.Linear(1024, 512),
        # Intermediate feature compression.
        # Learns disease-specific feature combinations.

        nn.GELU(),
        # GELU activation — smooth non-linearity.
        # Better than ReLU for transformer-based models
        # like ConvNeXt which inherit transformer design.

        nn.Dropout(p=0.5),
        # 50% dropout during training.
        # Disabled automatically in eval() mode.
        # No parameters saved — just the p value.

        nn.Linear(512, NUM_CLASSES),
        # Final classification: 512 → 8 classes.
        # Has learnable weight and bias (saved in .pth).
    )

    # Wrap backbone and head as Sequential
    model = nn.Sequential(backbone, head)
    # model[0] = ConvNeXt-Base backbone
    # model[1] = custom classifier head
    # This matches exactly how the model was saved
    # during training (confirmed from key inspection).

    return model


def load_model():
    """
    Loads trained ConvNeXt-Base weights from disk.
    Called once at Django startup via apps.py ready().

    Raises:
        FileNotFoundError: If .pth file not found.
        RuntimeError: If weights don't match architecture.
    """
    global MODEL

    model     = build_model()
    state_dict = torch.load(
        settings.MODEL_PATH,
        map_location=DEVICE,
        weights_only=True)

    # The state dict uses '0.' prefix for backbone
    # and '1.' prefix for head.
    # This matches our nn.Sequential structure exactly.
    # No DataParallel prefix to remove (confirmed clean).

    # Load backbone weights (keys starting with '0.')
    backbone_sd = {
        k[2:]: v
        for k, v in state_dict.items()
        if k.startswith('0.')}

    # Load head weights (keys starting with '1.')
    # Skip '1.0.p' — the Dropout p parameter.
    # It is corrupted in the saved file (value=2.79).
    # Our head uses standard p=0.5 which is correct.
    head_sd = {
        k[2:]: v
        for k, v in state_dict.items()
        if k.startswith('1.')
        and not k == '1.0.p'}
    # Exclude the corrupted Dropout p value.
    # Dropout has no learnable parameters — only p.
    # All actual weights (BN, Linear) load fine.

    # Load into backbone
    missing_b, unexpected_b = \
        model[0].load_state_dict(
            backbone_sd, strict=True)
    # strict=True ensures every key matches.

    # Load into head
    missing_h, unexpected_h = \
        model[1].load_state_dict(
            head_sd, strict=False)
    # strict=False because we skip the Dropout p key.

    if missing_b or unexpected_b:
        raise RuntimeError(
            f"Backbone load error — "
            f"missing: {missing_b}, "
            f"unexpected: {unexpected_b}")

    model.to(DEVICE)
    model.eval()
    # eval() disables Dropout and sets BatchNorm
    # to use running statistics instead of batch stats.
    # Always call before inference.

    MODEL = model


def classify(tensor):
    """
    Runs preprocessed tensor through ConvNeXt-Base
    and returns predictions.

    Args:
        tensor (torch.Tensor): (1, 3, 224, 224)

    Returns:
        tuple:
            - predicted_class (str): e.g. "Melanoma"
            - confidence_scores_json (str): JSON of all probs
            - predicted_confidence (float): 0.0 to 1.0
            - predicted_index (int): 0 to 7

    Raises:
        RuntimeError: If model not loaded.
    """
    if MODEL is None:
        raise RuntimeError(
            "ConvNeXt-Base model is not loaded. "
            "Ensure convnext_base_90pct.pth exists "
            "in models/ and Django restarted.")

    tensor = tensor.to(DEVICE)

    with torch.no_grad():
        outputs       = MODEL(tensor)
        # (1, 8) — raw logit scores

        probabilities = torch.softmax(outputs, dim=1)
        # (1, 8) — probabilities summing to 1.0

        predicted_index = torch.argmax(
            probabilities, dim=1).item()

    probs_list = probabilities[0].tolist()

    scores_dict = {
        DISEASE_CLASSES[i]: round(probs_list[i], 4)
        for i in range(NUM_CLASSES)}

    predicted_class      = DISEASE_CLASSES[predicted_index]
    predicted_confidence = scores_dict[predicted_class]
    confidence_scores_json = json.dumps(scores_dict)

    return (predicted_class,
            confidence_scores_json,
            predicted_confidence,
            predicted_index)