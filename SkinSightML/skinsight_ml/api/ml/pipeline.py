# api/ml/pipeline.py

import os
from django.conf import settings
from .preprocessor import preprocess
from .classifier import classify, MODEL
from .gradcam import generate_heatmap
from .severity import calculate_severity


def run_pipeline(case_id, image_url):
    """
    Orchestrates the complete ML analysis pipeline.
    This is the single entry point called by views.py.

    Steps:
        1. Validate image file exists
        2. Preprocess image (CLAHE + transforms)
        3. Classify with ResNet-50
        4. Generate Grad-CAM heatmap
        5. Calculate severity score
        6. Return complete result dict

    Args:
        case_id (int): The case ID from Spring Boot.
        image_url (str): Relative path to the image file.
            e.g. "uploads/cases/patient_1_1704067200000.jpg"

    Returns:
        dict: Complete analysis result with all fields
            needed to build MLResponseDto in Spring Boot.

    Raises:
        FileNotFoundError: If image does not exist on disk.
        RuntimeError: If model is not loaded.
        Exception: Any other pipeline failure.
    """

    # ── Step 1: Validate image file exists ────────────────────
    project_root = settings.BASE_DIR.parent.parent
    # Navigate up to SkinSight Project/ root.
    # BASE_DIR = skinsight_ml/ (where manage.py is)
    # BASE_DIR.parent = SkinSightML/
    # BASE_DIR.parent.parent = SkinSight Project/

    full_image_path = os.path.join(
        project_root, image_url)
    # Build absolute path to the image file.
    # e.g. /Users/.../SkinSight Project/
    #       uploads/cases/patient_1_...jpg

    if not os.path.exists(full_image_path):
        raise FileNotFoundError(
            f"Image not found at: {full_image_path}\n"
            f"Make sure Spring Boot saved the image "
            f"to the shared uploads/ directory.")

    # ── Step 2: Preprocess image ───────────────────────────────
    tensor, enhanced_rgb = preprocess(full_image_path)
    # tensor:       (1, 3, 224, 224) — fed to ResNet-50
    # enhanced_rgb: (224, 224, 3)   — used for heatmap overlay

    # ── Step 3: Classify with ResNet-50 ───────────────────────
    if MODEL is None:
        raise RuntimeError(
            "ResNet-50 model is not loaded. "
            "Train the model first and ensure "
            "models/resnet50_skinsight.pth exists.")

    predicted_class, confidence_scores_json, \
        predicted_confidence, predicted_index = \
        classify(tensor)
    # predicted_class:       e.g. "Melanoma"
    # confidence_scores_json: JSON string of all probabilities
    # predicted_confidence:  e.g. 0.8734
    # predicted_index:       e.g. 0

    # ── Step 4: Generate Grad-CAM heatmap ─────────────────────
    heatmap_url = generate_heatmap(
        MODEL,
        tensor,
        enhanced_rgb,
        predicted_index,
        case_id)
    # Returns relative path like:
    # "uploads/heatmaps/case_1_heatmap.jpg"
    # Also saves the actual image file to disk.

    # ── Step 5: Calculate severity score ──────────────────────
    from .gradcam import GradCAM
    import torch

    # Re-run Grad-CAM to get the raw activation map
    # (not the saved image, but the numpy array)
    # needed for severity calculation.
    grad_cam = GradCAM(MODEL)
    cam = grad_cam.generate(tensor, predicted_index)
    grad_cam.remove_hooks()
    # cam shape: (224, 224) — activation values 0-1

    severity_score, severity_level = \
        calculate_severity(predicted_confidence, cam)
    # severity_score: e.g. 0.7342
    # severity_level: e.g. "SEVERE"

    # ── Step 6: Return complete result ────────────────────────
    return {
        'case_id':           case_id,
        'predicted_class':   predicted_class,
        'confidence_scores': confidence_scores_json,
        'heatmap_url':       heatmap_url,
        'severity_score':    severity_score,
        'severity_level':    severity_level,
        'success':           True,
        'error_message':     None
    }
    # This dict maps directly to MLResponseDto in Spring Boot:
    # predicted_class   → DiagnosisResult.predictedClass
    # confidence_scores → DiagnosisResult.confidenceScores
    # heatmap_url       → DiagnosisResult.heatmapUrl
    # severity_score    → DiagnosisResult.severityScore
    # severity_level    → DiagnosisResult.severityLevel