# api/ml/preprocessor.py

import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
import torch

# ── ImageNet normalization constants ──────────────────────────
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

IMAGE_SIZE = 384
# MUST match training resolution.
# This model was trained at 384×384.
# ConvNeXt-Base at 384 gives:
#   backbone output: (B, 1024, 12, 12)
# At 224 it gives:
#   backbone output: (B, 1024, 7, 7)
# AdaptiveAvgPool2d(1) handles both — but
# the feature distribution at 224 differs from
# what the model learned at 384.
# Using the wrong size degrades accuracy.
# Always match inference size to training size.


def load_image(image_path):
    """
    Loads image from disk using OpenCV.

    Args:
        image_path (str): Full path to image.

    Returns:
        numpy.ndarray: BGR image.

    Raises:
        FileNotFoundError: If image not found.
    """
    image = cv2.imread(str(image_path))
    if image is None:
        raise FileNotFoundError(
            f"Could not load image: {image_path}")
    return image


def apply_clahe(bgr_image):
    """
    Applies CLAHE contrast enhancement.
    Improves lesion boundary visibility.

    Args:
        bgr_image (numpy.ndarray): BGR image.

    Returns:
        numpy.ndarray: Enhanced BGR image.
    """
    lab   = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def bgr_to_rgb(bgr_image):
    """Converts OpenCV BGR to PyTorch RGB."""
    return cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)


def build_transform():
    """
    Builds transform pipeline for ConvNeXt-Base.
    Uses 384×384 — exactly the training resolution.
    """
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        # Resize to 384×384 to match training.

        transforms.ToTensor(),
        # PIL → tensor, (H,W,C) → (C,H,W), 0-255 → 0-1

        transforms.Normalize(
            mean=IMAGENET_MEAN,
            std=IMAGENET_STD),
        # Normalize with ImageNet stats.
        # Same normalization used during training.
    ])


def preprocess(image_path):
    """
    Complete preprocessing pipeline for ConvNeXt-Base.
    load → CLAHE → BGR2RGB → resize 384 → normalize → tensor

    Args:
        image_path (str): Path to skin lesion image.

    Returns:
        tuple:
            - tensor (torch.Tensor): Shape (1, 3, 384, 384)
            - original_rgb (numpy.ndarray): (384, 384, 3)
              CLAHE-enhanced RGB for Grad-CAM overlay.
    """

    # Step 1: Load from disk
    bgr_image = load_image(image_path)

    # Step 2: CLAHE contrast enhancement
    enhanced_bgr = apply_clahe(bgr_image)

    # Step 3: BGR → RGB
    enhanced_rgb = bgr_to_rgb(enhanced_bgr)
    # Saved for Grad-CAM overlay.

    # Step 4: Convert to PIL
    pil_image = Image.fromarray(enhanced_rgb)

    # Step 5: Apply transforms
    transform = build_transform()
    tensor    = transform(pil_image)
    # Shape: (3, 384, 384)

    # Step 6: Add batch dimension
    tensor = tensor.unsqueeze(0)
    # Shape: (1, 3, 384, 384)

    return tensor, enhanced_rgb