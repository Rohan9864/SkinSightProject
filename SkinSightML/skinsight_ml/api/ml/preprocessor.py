import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
import torch


# ── ImageNet normalization constants ──────────────────────────
# ResNet-50 was pretrained on ImageNet dataset.
# We must normalize our images using the exact same
# mean and standard deviation used during pretraining.
# If we use different values, the model gives poor results
# because the input distribution does not match what
# the model expects from its training.
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

# ── Target image size for ResNet-50 ──────────────────────────
IMAGE_SIZE = 224
# ResNet-50 expects 224×224 pixel images.
# All uploaded images are resized to this size
# regardless of their original dimensions.


def load_image(image_path):
    """
    Loads an image from disk using OpenCV.

    Args:
        image_path (str): Full path to the image file.

    Returns:
        numpy.ndarray: Image in BGR format (OpenCV default).

    Raises:
        FileNotFoundError: If the image does not exist.
        ValueError: If the file cannot be read as an image.
    """
    image = cv2.imread(str(image_path))
    # cv2.imread reads the image from disk.
    # Returns a numpy array of shape (H, W, 3)
    # where 3 channels are in BGR order (not RGB).
    # OpenCV uses BGR by default — important to remember.

    if image is None:
        raise FileNotFoundError(
            f"Could not load image from: {image_path}\n"
            f"File may not exist or is not a valid image.")

    return image


def apply_clahe(bgr_image):
    """
    Applies CLAHE (Contrast Limited Adaptive Histogram
    Equalization) to enhance lesion visibility.

    CLAHE improves local contrast in the image which
    helps the model detect subtle skin lesion features
    that might be hard to see in the original image.

    Args:
        bgr_image (numpy.ndarray): Image in BGR format.

    Returns:
        numpy.ndarray: CLAHE-enhanced image in BGR format.
    """

    # Step 1: Convert BGR → LAB color space
    lab = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2LAB)
    # LAB color space separates:
    # L = Lightness (brightness)  ← we enhance this
    # A = Green-Red color axis
    # B = Blue-Yellow color axis
    #
    # We apply CLAHE only to the L channel because
    # contrast enhancement should affect brightness,
    # not the actual colors of the lesion.
    # Changing colors would distort clinical information.

    # Step 2: Create CLAHE object
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8))
    # clipLimit=2.0 — limits contrast amplification.
    # Without this limit, CLAHE would over-amplify
    # noise in uniform areas of the image.
    # 2.0 is the standard clinical imaging value.
    #
    # tileGridSize=(8, 8) — divides image into 8×8 tiles.
    # Histogram equalization is applied separately
    # in each tile for local contrast enhancement.
    # Adjacent tiles are blended to avoid visible borders.

    # Step 3: Apply CLAHE to only the L channel
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    # lab[:, :, 0] selects all rows, all columns,
    # channel index 0 which is the L (lightness) channel.
    # We replace it with the CLAHE-enhanced version.

    # Step 4: Convert back to BGR
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    # Convert back from LAB to BGR so we can
    # continue processing with OpenCV or convert to RGB.

    return enhanced


def bgr_to_rgb(bgr_image):
    """
    Converts an OpenCV BGR image to RGB format.

    Args:
        bgr_image (numpy.ndarray): Image in BGR format.

    Returns:
        numpy.ndarray: Image in RGB format.
    """
    return cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    # PyTorch and PIL work with RGB images.
    # OpenCV works with BGR images.
    # We must convert before passing to transforms.
    # Failing to convert causes color distortion —
    # reds and blues are swapped which confuses the model.


def build_transform():
    """
    Builds the PyTorch transform pipeline.
    Applied to the enhanced RGB image before
    passing it to the ResNet-50 model.

    Returns:
        torchvision.transforms.Compose: Transform pipeline.
    """
    return transforms.Compose([

        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        # Resize image to 224×224 pixels.
        # ResNet-50 requires this exact size.
        # Aspect ratio is not preserved — image is
        # stretched to fit. This is standard practice
        # for dermoscopy images which are usually
        # close to square already.

        transforms.ToTensor(),
        # Convert PIL Image or numpy array to tensor.
        # Shape changes: (H, W, C) → (C, H, W)
        # Values change: 0-255 integers → 0.0-1.0 floats
        # PyTorch expects channels-first format (C, H, W).

        transforms.Normalize(
            mean=IMAGENET_MEAN,
            std=IMAGENET_STD),
        # Normalize each channel using ImageNet statistics.
        # Formula per pixel: (pixel - mean) / std
        # This centers the data around 0 and scales
        # it to a range the pretrained model expects.
        # Without this, accuracy drops significantly.
    ])


def preprocess(image_path):
    """
    Complete preprocessing pipeline.
    Runs all steps in sequence and returns the
    processed tensor ready for ResNet-50 inference.

    Args:
        image_path (str): Path to the skin lesion image.

    Returns:
        tuple:
            - tensor (torch.Tensor): Shape (1, 3, 224, 224)
              ready for model input.
            - original_rgb (numpy.ndarray): The CLAHE-enhanced
              image in RGB format for Grad-CAM overlay.
    """

    # Step 1: Load image from disk
    bgr_image = load_image(image_path)
    # Shape: (H, W, 3) — original image dimensions.

    # Step 2: Apply CLAHE contrast enhancement
    enhanced_bgr = apply_clahe(bgr_image)
    # Shape: (H, W, 3) — same dimensions, better contrast.

    # Step 3: Convert BGR to RGB
    enhanced_rgb = bgr_to_rgb(enhanced_bgr)
    # Shape: (H, W, 3) — RGB format for PyTorch.
    # We save this for Grad-CAM overlay later.
    # Grad-CAM needs the processed image to blend
    # the heatmap onto.

    # Step 4: Convert numpy array to PIL Image
    pil_image = Image.fromarray(enhanced_rgb)
    # PIL Image is required by torchvision transforms.
    # transforms.ToTensor() expects either a PIL Image
    # or a numpy array.

    # Step 5: Apply transforms (resize, tensor, normalize)
    transform = build_transform()
    tensor = transform(pil_image)
    # Shape after transform: (3, 224, 224)
    # 3 channels, 224 height, 224 width.

    # Step 6: Add batch dimension
    tensor = tensor.unsqueeze(0)
    # Shape: (1, 3, 224, 224)
    # PyTorch models expect a batch as the first dimension.
    # unsqueeze(0) adds a dimension at position 0.
    # We are processing one image at a time (batch size 1).

    return tensor, enhanced_rgb
    # Return both:
    # - tensor: fed into ResNet-50 for classification
    # - enhanced_rgb: used by Grad-CAM for heatmap overlay