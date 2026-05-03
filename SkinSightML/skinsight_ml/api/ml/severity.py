# api/ml/severity.py

import numpy as np


# ── Severity thresholds ───────────────────────────────────────
MILD_THRESHOLD     = 0.40
MODERATE_THRESHOLD = 0.70
# S < 0.40          → MILD
# 0.40 ≤ S < 0.70   → MODERATE
# S ≥ 0.70          → SEVERE

# ── Severity formula weights ──────────────────────────────────
CONFIDENCE_WEIGHT  = 0.6
LESION_AREA_WEIGHT = 0.4
# S = (0.6 × confidence) + (0.4 × lesion_area_ratio)
# Confidence contributes 60% — model certainty matters most.
# Lesion area contributes 40% — larger lesions are riskier.


def calculate_lesion_area(cam):
    """
    Calculates the lesion area ratio from the
    Grad-CAM activation map.

    The lesion area is the proportion of the image
    occupied by the high-activation region.
    A larger activated area suggests a more
    extensive skin condition.

    Args:
        cam (numpy.ndarray): Grad-CAM activation map.
            Shape: (224, 224), values 0.0 to 1.0.

    Returns:
        float: Lesion area ratio (0.0 to 1.0).
            0.0 = no activation
            1.0 = entire image is activated
    """

    # Threshold the activation map at 50% of maximum
    threshold = 0.5 * cam.max()
    # We consider pixels activated if they are at least
    # 50% of the maximum activation value.
    # This isolates the most significant regions.

    if threshold == 0:
        return 0.0
    # If max activation is 0, nothing is activated.
    # Return 0 to avoid division by zero.

    # Count activated pixels
    activated_pixels = np.sum(cam >= threshold)
    # np.sum counts how many pixels meet the condition.
    # cam >= threshold creates a boolean mask.
    # True = activated, False = not activated.
    # np.sum counts the True values.

    total_pixels = cam.size
    # cam.size = 224 × 224 = 50176 total pixels.

    lesion_area_ratio = activated_pixels / total_pixels
    # Proportion of image that is activated.
    # e.g. if 10000 pixels are activated:
    # 10000 / 50176 ≈ 0.199 (about 20% of image)

    return float(lesion_area_ratio)


def calculate_severity(confidence, cam):
    """
    Calculates the severity score and level using
    our custom severity scoring algorithm.

    Algorithm:
        A = lesion area ratio from Grad-CAM
        C = model confidence for predicted class
        S = (0.6 × C) + (0.4 × A)

    Args:
        confidence (float): Model confidence score (0-1).
            The probability of the predicted disease class.
        cam (numpy.ndarray): Grad-CAM activation map.
            Shape: (224, 224), values 0.0 to 1.0.

    Returns:
        tuple:
            - severity_score (float): S value (0.0 to 1.0).
            - severity_level (str): "MILD", "MODERATE",
              or "SEVERE".
    """

    # Step 1: Calculate lesion area ratio from Grad-CAM
    lesion_area = calculate_lesion_area(cam)
    # Value between 0.0 and 1.0.

    # Step 2: Apply severity formula
    severity_score = (
        (CONFIDENCE_WEIGHT  * confidence) +
        (LESION_AREA_WEIGHT * lesion_area)
    )
    # S = (0.6 × C) + (0.4 × A)
    # Both C and A are between 0 and 1.
    # S is also between 0 and 1.
    # Higher confidence + larger lesion = higher severity.

    severity_score = round(severity_score, 4)
    # Round to 4 decimal places for clean output.

    # Step 3: Map score to severity level
    if severity_score < MILD_THRESHOLD:
        severity_level = 'MILD'
        # S < 0.40 — Low confidence or small lesion area.
        # Likely a benign or early-stage condition.
    elif severity_score < MODERATE_THRESHOLD:
        severity_level = 'MODERATE'
        # 0.40 ≤ S < 0.70 — Medium confidence or
        # moderate lesion area. Warrants attention.
    else:
        severity_level = 'SEVERE'
        # S ≥ 0.70 — High confidence and/or large area.
        # Urgent clinical attention recommended.

    return severity_score, severity_level