import torch
import torch.nn as nn
import torch.nn.functional as F
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
# Order matches ISIC 2019 training column order:
# MEL=0, NV=1, BCC=2, AK=3, BKL=4, DF=5, VASC=6, SCC=7
# If this order is wrong, all predictions will be mislabeled.

NUM_CLASSES = len(DISEASE_CLASSES)
# = 8

# ── Global model variable ─────────────────────────────────────
MODEL  = None
DEVICE = torch.device('cpu')
# CPU inference on Django server.
# ConvNeXt-Base at 384×384 on CPU: ~3-6 seconds per image.
# Acceptable latency for this medical review system.


# ── GeM Pooling ───────────────────────────────────────────────
class GeM(nn.Module):
    """
    Generalized Mean Pooling.

    More powerful than average pooling for fine-grained
    recognition tasks like skin disease classification.

    Formula: ( mean( x^p ) ) ^ (1/p)

    When p=1: equivalent to average pooling.
    When p→∞: equivalent to max pooling.
    Learned p≈2.80 — between average and max pooling.

    The p parameter is LEARNED during training.
    The saved value (≈2.80) must be loaded from
    the .pth file, not hardcoded.
    """

    def __init__(self, p=3, eps=1e-6):
        super().__init__()
        self.p   = nn.Parameter(torch.ones(1) * p)
        # p is a learnable parameter.
        # Initialized to 3.0, converged to ≈2.80.
        # Saved in state dict as key '1.0.p'.
        # MUST be loaded from .pth file.

        self.eps = eps
        # Small epsilon prevents log(0) errors
        # when clamping negative activations.

    def forward(self, x):
        return F.adaptive_avg_pool2d(
            x.clamp(min=self.eps).pow(self.p),
            output_size=1
        ).pow(1.0 / self.p)
        # Step 1: clamp removes negatives (min=eps)
        # Step 2: raise each element to power p
        # Step 3: average pool to (1,1)
        # Step 4: take p-th root
        # Result shape: (B, 1024, 1, 1)


def build_model():
    """
    Reconstructs exact ConvNeXt-Base architecture
    used during training.

    Verified: loads with zero missing/unexpected keys.

    Architecture:
        backbone  = ConvNeXt-Base (timm, no head)
        head[0]   = GeM(p=3, learnable)
        head[1]   = Flatten
        head[2]   = BatchNorm1d(1024, momentum=0.01)
        head[3]   = Linear(1024 → 512)
        head[4]   = SiLU
        head[5]   = Dropout(p=0.5)
        head[6]   = Linear(512 → 8)
        model     = nn.Sequential(backbone, head)

    Returns:
        torch.nn.Module: Full ConvNeXt-Base + GeM model.
    """
    # Build ConvNeXt-Base backbone
    backbone = timm.create_model(
        'convnext_base',
        pretrained=False,
        num_classes=0,
        global_pool='')
    # pretrained=False — we load our own weights.
    # num_classes=0 — removes timm's default head.
    # global_pool='' — disables timm's pooling.
    # Output: (B, 1024, 12, 12) for 384×384 input.

    # Build custom classifier head
    head = nn.Sequential(
        GeM(p=3),
        # index 0: GeM pooling
        # (B, 1024, 12, 12) → (B, 1024, 1, 1)
        # p is learned — loaded from state dict key '1.0.p'
        # Trained value: ≈2.80

        nn.Flatten(),
        # index 1: flatten spatial dims
        # (B, 1024, 1, 1) → (B, 1024)

        nn.BatchNorm1d(1024, momentum=0.01),
        # index 2: normalize feature vector
        # momentum=0.01 is slower than default 0.1
        # More stable statistics for medical imaging
        # Weights loaded from keys '1.2.*'

        nn.Linear(1024, 512),
        # index 3: feature compression
        # Weights loaded from keys '1.3.*'

        nn.SiLU(),
        # index 4: Swish activation (no parameters)
        # Same activation used inside ConvNeXt blocks.
        # Smoother gradient than ReLU.

        nn.Dropout(p=0.5),
        # index 5: 50% dropout (no parameters)
        # Disabled automatically in eval() mode.

        nn.Linear(512, NUM_CLASSES),
        # index 6: final classification
        # 512 → 8 disease classes
        # Weights loaded from keys '1.6.*'
    )

    # Wrap as Sequential matching training structure
    model = nn.Sequential(backbone, head)
    # model[0] = ConvNeXt-Base backbone (keys '0.*')
    # model[1] = classifier head (keys '1.*')

    return model


def load_model():
    """
    Loads trained ConvNeXt-Base weights from disk.
    Called once at Django startup via apps.py ready().

    The state dict uses strict=True which means
    every key must match exactly — guaranteeing
    the correct architecture is used.

    Raises:
        FileNotFoundError: If .pth file not found.
        RuntimeError: If architecture mismatch.
    """
    global MODEL

    model = build_model()

    state_dict = torch.load(
        settings.MODEL_PATH,
        map_location=DEVICE,
        weights_only=True)
    # weights_only=True: security measure.
    # Only loads tensor data, not Python objects.

    missing, unexpected = model.load_state_dict(
        state_dict, strict=True)
    # strict=True: every key must match.
    # Zero missing, zero unexpected — verified.
    #
    # Key mapping:
    # '0.*'   → ConvNeXt-Base backbone weights
    # '1.0.p' → GeM learned p parameter (≈2.80)
    # '1.2.*' → BatchNorm1d weights
    # '1.3.*' → Linear(1024→512) weights
    # '1.6.*' → Linear(512→8) weights

    if missing:
        raise RuntimeError(
            f"Missing keys in model: {missing}\n"
            f"Architecture mismatch — check classifier.py")

    if unexpected:
        raise RuntimeError(
            f"Unexpected keys: {unexpected}\n"
            f"Architecture mismatch — check classifier.py")

    model.to(DEVICE)
    model.eval()
    # eval() disables:
    # - Dropout (passes through without zeroing)
    # - BatchNorm training mode (uses running stats)
    # Always call before inference.

    MODEL = model


def classify(tensor):
    """
    Runs preprocessed image tensor through
    ConvNeXt-Base and returns predictions.

    Args:
        tensor (torch.Tensor): Shape (1, 3, 384, 384)
            Preprocessed and normalized image tensor.

    Returns:
        tuple:
            - predicted_class (str):
              e.g. "Melanoma"
            - confidence_scores_json (str):
              JSON of all 8 class probabilities.
              e.g. '{"Melanoma": 0.8734, ...}'
            - predicted_confidence (float):
              Probability of predicted class. 0.0-1.0.
            - predicted_index (int):
              Index 0-7 of predicted class.

    Raises:
        RuntimeError: If model not loaded.
    """
    if MODEL is None:
        raise RuntimeError(
            "ConvNeXt-Base model is not loaded. "
            "Ensure convnext_base_90pct.pth exists "
            "in models/ directory and Django restarted.")

    tensor = tensor.to(DEVICE)

    with torch.no_grad():
        # Disable gradient computation for inference.
        # Saves memory and speeds up prediction.

        outputs = MODEL(tensor)
        # Forward pass through ConvNeXt-Base + GeM head.
        # Output: (1, 8) raw logit scores.

        probabilities = torch.softmax(outputs, dim=1)
        # Convert logits to probabilities.
        # All 8 values sum to exactly 1.0.

        predicted_index = torch.argmax(
            probabilities, dim=1).item()
        # Index of the class with highest probability.

    # Build output structures
    probs_list = probabilities[0].tolist()
    # Convert tensor to Python list.

    scores_dict = {
        DISEASE_CLASSES[i]: round(probs_list[i], 4)
        for i in range(NUM_CLASSES)}
    # Dict of class_name → probability.
    # Rounded to 4 decimal places.

    predicted_class      = DISEASE_CLASSES[predicted_index]
    predicted_confidence = scores_dict[predicted_class]
    confidence_scores_json = json.dumps(scores_dict)
    # JSON string for storage in MySQL TEXT column.
    # Frontend parses this to render a bar chart.

    return (predicted_class,
            confidence_scores_json,
            predicted_confidence,
            predicted_index)