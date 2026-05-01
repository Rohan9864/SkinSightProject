# api/ml/classifier.py

import torch
import torch.nn as nn
import torchvision.models as models
from django.conf import settings
import json

# ── Disease class names from ISIC 2019 dataset ───────────────
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
# These 8 classes match the ISIC 2019 dataset exactly.
# The order here must match the order used during training.
# Index 0 = Melanoma, Index 1 = Melanocytic Nevi etc.
# If the order is wrong, predictions will be mislabeled.

NUM_CLASSES = len(DISEASE_CLASSES)
# = 8

# ── Global model variable ─────────────────────────────────────
MODEL = None
# We store the loaded model in this global variable.
# It is loaded once at startup (via apps.py ready())
# and reused for every request.
#
# Why global? Loading ResNet-50 takes 2-3 seconds.
# If we loaded it on every request, each analysis
# would take 3+ seconds just for model loading.
# With a global variable, model loading happens once
# and inference takes milliseconds.

DEVICE = torch.device(
    'cuda' if torch.cuda.is_available() else 'cpu')
# Use GPU if available, otherwise CPU.
# torch.cuda.is_available() returns True if a
# CUDA-compatible GPU is detected.
# For most laptops this will be 'cpu'.
# GPU makes inference 10-50x faster.


def build_model():
    """
    Builds the ResNet-50 model architecture
    with our custom 8-class output layer.

    Returns:
        torch.nn.Module: ResNet-50 with modified FC layer.
    """
    model = models.resnet50(weights=None)
    # weights=None means do not download ImageNet weights.
    # We will load our own trained weights separately.
    # In older PyTorch versions this was pretrained=False.

    num_features = model.fc.in_features
    # model.fc is the final fully-connected layer.
    # in_features = 2048 for ResNet-50.
    # This is the size of the feature vector
    # that feeds into the classification layer.

    model.fc = nn.Linear(num_features, NUM_CLASSES)
    # Replace the original 1000-class ImageNet layer
    # with our 8-class skin disease layer.
    # nn.Linear(2048, 8) creates a linear transformation:
    # input: feature vector of size 2048
    # output: 8 scores (one per disease class)
    # This is the same replacement done during training.

    return model


def load_model():
    """
    Loads the trained model weights from disk
    and stores the model in the global MODEL variable.
    Called once at Django startup via apps.py.

    Raises:
        FileNotFoundError: If the .pth file does not exist.
        Exception: If weights cannot be loaded.
    """
    global MODEL
    # Declare we are modifying the global MODEL variable.
    # Without this, Python would create a local variable
    # and the global would remain None.

    model = build_model()
    # Build the architecture first.

    model.load_state_dict(
        torch.load(
            settings.MODEL_PATH,
            map_location=DEVICE,
            weights_only=True))
    # torch.load reads the .pth file from disk.
    # map_location=DEVICE ensures weights load onto
    # the correct device (CPU or GPU) regardless of
    # which device was used during training.
    # weights_only=True is a security measure —
    # only loads tensor data, not arbitrary Python objects.
    #
    # load_state_dict() copies the weights from the
    # loaded dictionary into the model's parameters.
    # The architecture must match exactly —
    # same layer names, same shapes.

    model.to(DEVICE)
    # Move the model to the target device.
    # If DEVICE is 'cuda', model runs on GPU.
    # If DEVICE is 'cpu', model runs on CPU.

    model.eval()
    # Set model to evaluation mode.
    # This disables:
    # - Dropout layers (used during training to
    #   randomly zero out neurons, preventing overfitting)
    # - BatchNorm training behavior (uses running
    #   statistics instead of batch statistics)
    # Always call eval() before inference.

    MODEL = model
    # Store in global variable for reuse.


def classify(tensor):
    """
    Runs the preprocessed image tensor through
    ResNet-50 and returns the predicted class
    and confidence scores for all 8 classes.

    Args:
        tensor (torch.Tensor): Preprocessed image tensor.
            Shape: (1, 3, 224, 224)

    Returns:
        tuple:
            - predicted_class (str): Name of predicted disease.
            - confidence_scores (str): JSON string of all
              class probabilities.
            - predicted_confidence (float): Confidence score
              of the predicted class (0.0 to 1.0).
            - predicted_index (int): Index of predicted class.

    Raises:
        RuntimeError: If model is not loaded.
    """
    if MODEL is None:
        raise RuntimeError(
            "Model is not loaded. "
            "Call load_model() first.")

    tensor = tensor.to(DEVICE)
    # Move input tensor to same device as model.
    # Both must be on the same device (CPU or GPU).

    with torch.no_grad():
        # Disable gradient computation during inference.
        # Gradients are only needed during training
        # for backpropagation.
        # torch.no_grad() reduces memory usage and
        # speeds up inference significantly.

        outputs = MODEL(tensor)
        # Forward pass through the network.
        # outputs shape: (1, 8)
        # 1 = batch size, 8 = number of classes
        # Each value is a raw logit score.
        # Logits can be any real number (positive or negative).

        probabilities = torch.softmax(outputs, dim=1)
        # Softmax converts raw logits to probabilities.
        # All values are now between 0.0 and 1.0
        # and sum to exactly 1.0.
        # dim=1 applies softmax across the class dimension.
        # e.g. [0.87, 0.08, 0.02, 0.01, 0.01, 0.00, 0.00, 0.01]

        predicted_index = torch.argmax(
            probabilities, dim=1).item()
        # argmax finds the index of the highest probability.
        # .item() converts the PyTorch tensor to a
        # plain Python integer.
        # e.g. if Melanoma has highest probability → index 0

    # Build scores dictionary
    scores_dict = {}
    probs_list = probabilities[0].tolist()
    # [0] selects the first (only) item in the batch.
    # .tolist() converts the tensor to a Python list.

    for i, class_name in enumerate(DISEASE_CLASSES):
        scores_dict[class_name] = round(probs_list[i], 4)
        # Round to 4 decimal places for clean output.
        # e.g. {"Melanoma": 0.8734, "Melanocytic Nevi": 0.0823}

    predicted_class = DISEASE_CLASSES[predicted_index]
    # Map index back to class name.
    # e.g. index 0 → "Melanoma"

    predicted_confidence = scores_dict[predicted_class]
    # The probability of the predicted class.
    # Used by the severity scoring algorithm.

    confidence_scores_json = json.dumps(scores_dict)
    # Convert dict to JSON string for storage.
    # Spring Boot stores this as TEXT in MySQL.
    # React frontend parses it to render a bar chart.
    # e.g. '{"Melanoma": 0.8734, "Melanocytic Nevi": 0.0823}'

    return (predicted_class,
            confidence_scores_json,
            predicted_confidence,
            predicted_index)