# api/ml/severity.py  — IMPROVED VERSION

import numpy as np

# ── Clinical severity tiers ───────────────────────────────────
# Based on dermatology clinical guidelines.
# Each disease class has a base severity score
# reflecting its clinical risk profile.
# Source: ISIC clinical risk stratification guidelines.

CLINICAL_BASE_SEVERITY = {
    'Melanoma':               0.85,
    # Melanoma is the most dangerous skin cancer.
    # High mortality if not detected early.
    # Base severity always starts HIGH.

    'Squamous Cell Carcinoma': 0.75,
    # SCC can metastasize if untreated.
    # Second most dangerous. HIGH base.

    'Basal Cell Carcinoma':   0.55,
    # BCC rarely metastasizes but requires
    # treatment. MODERATE base.

    'Actinic Keratosis':      0.45,
    # Pre-cancerous lesion. Can progress to SCC.
    # MODERATE base — needs monitoring.

    'Vascular Lesion':        0.35,
    # Usually benign but some types require
    # treatment. LOW-MODERATE base.

    'Benign Keratosis':       0.20,
    # Non-cancerous. LOW base.

    'Dermatofibroma':         0.15,
    # Benign fibrous nodule. LOW base.

    'Melanocytic Nevi':       0.20,
    # Common mole. Usually benign.
    # LOW base but requires monitoring.
}

# ── Severity thresholds ───────────────────────────────────────
MILD_THRESHOLD     = 0.40
MODERATE_THRESHOLD = 0.65


def calculate_prediction_entropy(confidence_scores_dict):
    """
    Calculates Shannon entropy across all class probabilities.

    High entropy = model is uncertain across many classes.
    Low entropy = model is very confident in one class.

    In medical AI, high uncertainty is itself a risk signal.
    An uncertain model on a potentially malignant lesion
    should increase severity, not decrease it.

    Args:
        confidence_scores_dict (dict): class → probability

    Returns:
        float: Normalised entropy 0.0 to 1.0
    """
    probs = np.array(list(confidence_scores_dict.values()))
    probs = probs[probs > 0]
    # Remove zero probabilities to avoid log(0).

    entropy = -np.sum(probs * np.log(probs + 1e-10))
    # Shannon entropy formula.
    # Higher = more uncertain across classes.

    # Normalise by maximum possible entropy (uniform dist)
    max_entropy = np.log(len(confidence_scores_dict))
    if max_entropy == 0:
        return 0.0

    normalised_entropy = entropy / max_entropy
    # 0.0 = completely certain (one class = 1.0)
    # 1.0 = completely uncertain (all classes equal)

    return float(normalised_entropy)


def calculate_malignancy_probability(confidence_scores_dict):
    """
    Calculates the combined probability that the lesion
    belongs to a malignant or pre-malignant category.

    This is more clinically meaningful than the confidence
    of just the top predicted class.

    Malignant classes: Melanoma, SCC, BCC, AK
    Benign classes: NV, BKL, DF, VASC

    Args:
        confidence_scores_dict (dict): class → probability

    Returns:
        float: Combined malignant probability 0.0 to 1.0
    """
    malignant_classes = {
        'Melanoma',
        'Squamous Cell Carcinoma',
        'Basal Cell Carcinoma',
        'Actinic Keratosis',
    }

    malignant_prob = sum(
        prob for cls, prob
        in confidence_scores_dict.items()
        if cls in malignant_classes
    )
    # Sum of probabilities for all malignant classes.
    # Even if melanoma is only 30% likely,
    # if BCC adds another 25% and AK adds 15%,
    # the combined malignant probability is 70%.
    # This is far more clinically relevant than
    # just the top predicted class confidence.

    return float(malignant_prob)


def calculate_severity(
        predicted_class,
        confidence,
        confidence_scores_dict,
        cam):
    """
    Clinically grounded severity estimation.

    Algorithm (4 components):

    1. BASE SCORE (40% weight)
       From clinical risk tier of predicted class.
       Melanoma always starts HIGH. Nevi always LOW.
       This is the most important component.

    2. MALIGNANCY PROBABILITY (30% weight)
       Combined probability across all malignant classes.
       More informative than single-class confidence.

    3. UNCERTAINTY PENALTY (20% weight)
       High entropy → model uncertain → flag for review.
       Uncertainty in cancer screening = higher caution.

    4. LESION PROMINENCE (10% weight)
       Grad-CAM activation prominence.
       Limited weight because Grad-CAM ≠ lesion size.
       Only used as a minor tiebreaker.

    Args:
        predicted_class (str): Top predicted class name.
        confidence (float): Confidence of top prediction.
        confidence_scores_dict (dict): All class scores.
        cam (numpy.ndarray): Grad-CAM activation (H, W).

    Returns:
        tuple: (severity_score float, severity_level str,
                severity_explanation str)
    """

    # ── Component 1: Clinical base score ─────────────────────
    base_score = CLINICAL_BASE_SEVERITY.get(
        predicted_class, 0.40)
    # Default 0.40 for unknown classes.
    # Weight: 40% of final score.

    # ── Component 2: Malignancy probability ──────────────────
    malignancy_prob = calculate_malignancy_probability(
        confidence_scores_dict)
    # Combined probability of all malignant classes.
    # Weight: 30% of final score.

    # ── Component 3: Uncertainty penalty ─────────────────────
    entropy = calculate_prediction_entropy(
        confidence_scores_dict)
    # High entropy = uncertain prediction = more caution.
    # Weight: 20% of final score.
    #
    # For cancer screening, uncertainty should INCREASE
    # severity (refer to specialist) not decrease it.

    # ── Component 4: Lesion prominence from Grad-CAM ─────────
    cam_prominence = _calculate_cam_prominence(cam)
    # Limited weight: 10%
    # Grad-CAM shows attention, not actual lesion size.
    # Used only as a minor tiebreaker signal.

    # ── Combine components ────────────────────────────────────
    severity_score = (
        0.40 * base_score        +
        0.30 * malignancy_prob   +
        0.20 * entropy           +
        0.10 * cam_prominence
    )
    severity_score = round(
        min(1.0, max(0.0, severity_score)), 4)
    # Clamp to [0, 1] range.

    # ── Map to severity level ─────────────────────────────────
    if severity_score < MILD_THRESHOLD:
        severity_level = 'MILD'
       
    elif severity_score < MODERATE_THRESHOLD:
        severity_level = 'MODERATE'
        
    else:
        severity_level = 'SEVERE'
        
    return severity_score, severity_level


def _calculate_cam_prominence(cam):
    """
    Calculates how prominent the Grad-CAM activation is.
    Not the same as lesion size — limited diagnostic value.
    Used only as a minor signal (10% weight).

    Returns float 0.0 to 1.0.
    """
    if cam is None or cam.size == 0:
        return 0.0

    cam_max = cam.max()
    if cam_max == 0:
        return 0.0

    threshold  = 0.5 * cam_max
    active_pct = np.sum(cam >= threshold) / cam.size

    # Also consider peak intensity
    mean_active = cam[cam >= threshold].mean() \
        if np.any(cam >= threshold) else 0.0

    # Combine area and intensity
    prominence = 0.6 * active_pct + 0.4 * mean_active
    return float(min(1.0, prominence))