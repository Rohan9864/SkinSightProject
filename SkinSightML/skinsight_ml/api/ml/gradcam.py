# api/ml/gradcam.py

import cv2
import numpy as np
import torch
import os
from django.conf import settings


class GradCAM:
    """
    Gradient-weighted Class Activation Mapping.

    Generates a heatmap highlighting which regions
    of the input image most influenced the model's
    prediction. This is the explainability component —
    it shows the doctor and patient WHERE in the image
    the model detected the disease.

    How it works:
    1. Forward pass → get prediction
    2. Backward pass on predicted class score
    3. Capture gradients at last conv layer
    4. Global average pool gradients → importance weights
    5. Weighted sum of feature maps → activation map
    6. Apply ReLU → keep only positive activations
    7. Normalize and resize to original image size
    8. Apply color map and overlay on original image
    """

    def __init__(self, model, target_layer_name='layer4'):
        self.model = model
        # The loaded ResNet-50 model.

        self.target_layer_name = target_layer_name
        # We hook into 'layer4' — the last convolutional
        # block in ResNet-50 before the global average
        # pooling and fully connected layers.
        # layer4 has the highest-level semantic features
        # which correspond most directly to the predicted class.

        self.gradients = None
        # Stores gradients captured by the backward hook.
        # None until a backward pass is run.

        self.activations = None
        # Stores feature maps captured by the forward hook.
        # None until a forward pass is run.

        self.hooks = []
        # List of registered hooks.
        # We store them so we can remove them after use.
        # Not removing hooks causes memory leaks.

        self._register_hooks()

    def _register_hooks(self):
        """
        Registers forward and backward hooks on layer4.
        Hooks are callback functions that run automatically
        during forward and backward passes.
        """

        # Find layer4 in the model
        target_layer = dict(
            self.model.named_modules()
        ).get(self.target_layer_name)
        # named_modules() returns all layers with names.
        # We convert to dict and look up 'layer4'.

        if target_layer is None:
            raise ValueError(
                f"Layer '{self.target_layer_name}' "
                f"not found in model.")

        # Register forward hook — captures activations
        def forward_hook(module, input, output):
            self.activations = output.detach()
            # output is the feature map tensor from layer4.
            # Shape: (1, 2048, 7, 7) for 224×224 input.
            # detach() removes it from the computation graph
            # so it is just a plain tensor for storage.

        # Register backward hook — captures gradients
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
            # grad_output[0] is the gradient of the loss
            # with respect to the output of layer4.
            # Shape: (1, 2048, 7, 7)
            # These gradients tell us how much each
            # feature map location contributed to the
            # predicted class score.

        # Attach hooks to layer4
        forward_handle = target_layer.register_forward_hook(
            forward_hook)
        backward_handle = target_layer.register_full_backward_hook(
            backward_hook)

        self.hooks.extend(
            [forward_handle, backward_handle])

    def remove_hooks(self):
        """Removes all registered hooks to free memory."""
        for hook in self.hooks:
            hook.remove()
        self.hooks = []

    def generate(self, tensor, class_index):
        """
        Generates the Grad-CAM activation map.

        Args:
            tensor (torch.Tensor): Preprocessed image.
                Shape: (1, 3, 224, 224)
            class_index (int): Index of the predicted class.
                The heatmap highlights regions important
                for THIS specific class prediction.

        Returns:
            numpy.ndarray: Grad-CAM heatmap as a normalized
                float32 array. Values 0.0 to 1.0.
                Shape: (224, 224)
        """

        self.model.zero_grad()
        # Clear any existing gradients from previous calls.
        # Essential to prevent gradient accumulation.

        # Forward pass
        outputs = self.model(tensor)
        # outputs shape: (1, 8)
        # self.activations is now populated by forward hook.

        # Backward pass on the predicted class score
        class_score = outputs[0, class_index]
        # outputs[0] = first (only) item in batch.
        # [class_index] = score for the predicted class.
        # e.g. if predicted class is Melanoma (index 0):
        # class_score = raw logit score for Melanoma.

        class_score.backward()
        # Compute gradients of class_score with respect
        # to all model parameters.
        # self.gradients is now populated by backward hook.
        # Shape of gradients: (1, 2048, 7, 7)

        # Global average pooling of gradients
        weights = self.gradients.mean(dim=[2, 3],
                                       keepdim=True)
        # Average over the spatial dimensions (H, W).
        # dim=[2, 3] averages over height and width.
        # keepdim=True preserves the shape for broadcasting.
        # weights shape: (1, 2048, 1, 1)
        # Each weight represents the importance of
        # one feature map channel for the prediction.

        # Weighted combination of feature maps
        cam = (weights * self.activations).sum(
            dim=1, keepdim=True)
        # Multiply each feature map by its importance weight.
        # Sum across all 2048 channels (dim=1).
        # cam shape: (1, 1, 7, 7)
        # This 7×7 map encodes where the model focused.

        # Apply ReLU
        cam = torch.relu(cam)
        # ReLU sets negative values to 0.
        # Negative values mean regions that DECREASED
        # the class score — we only want regions that
        # INCREASED it (positive contributions).

        # Convert to numpy and normalize
        cam = cam.squeeze().cpu().numpy()
        # .squeeze() removes dimensions of size 1.
        # Shape: (7, 7)
        # .cpu() moves to CPU if on GPU.
        # .numpy() converts to numpy array.

        # Normalize to 0-1 range
        cam_min = cam.min()
        cam_max = cam.max()

        if cam_max - cam_min > 0:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)
        # Avoid division by zero if all values are equal.
        # After normalization: all values 0.0 to 1.0.
        # 1.0 = most important region for prediction.

        # Resize to image size
        cam = cv2.resize(cam, (224, 224))
        # Upsample from 7×7 to 224×224 using bilinear
        # interpolation (cv2 default).
        # Now each pixel of the heatmap corresponds to
        # a pixel in the original 224×224 image.

        return cam
        # Shape: (224, 224) — float32 array, values 0-1.


def generate_heatmap(model, tensor, original_rgb,
                      class_index, case_id):
    """
    Runs Grad-CAM and saves the heatmap overlay image.

    Args:
        model: Loaded ResNet-50 model.
        tensor: Preprocessed image tensor (1,3,224,224).
        original_rgb: CLAHE-enhanced image in RGB format.
        class_index: Index of predicted disease class.
        case_id: Case ID for naming the saved file.

    Returns:
        str: Relative file path of saved heatmap image.
            e.g. "uploads/heatmaps/case_1_heatmap.jpg"
    """

    # Step 1: Generate Grad-CAM activation map
    grad_cam = GradCAM(model)
    cam = grad_cam.generate(tensor, class_index)
    grad_cam.remove_hooks()
    # Always remove hooks after use to prevent memory leaks.

    # Step 2: Convert activation map to color heatmap
    cam_uint8 = np.uint8(255 * cam)
    # Scale 0-1 float to 0-255 uint8 for color mapping.

    heatmap = cv2.applyColorMap(
        cam_uint8, cv2.COLORMAP_JET)
    # Apply JET colormap:
    # Blue  → low activation (less important)
    # Green → medium activation
    # Red   → high activation (most important)
    # This produces the classic heat map visualization
    # used in medical imaging research.

    # Step 3: Convert original RGB image to BGR for OpenCV
    original_bgr = cv2.cvtColor(
        original_rgb, cv2.COLOR_RGB2BGR)
    # We need BGR for OpenCV operations.

    # Resize original to 224×224 if not already
    original_bgr = cv2.resize(original_bgr, (224, 224))

    # Step 4: Overlay heatmap on original image
    overlay = cv2.addWeighted(
        original_bgr, 0.6,
        heatmap, 0.4,
        0)
    # addWeighted blends two images:
    # result = (0.6 × original) + (0.4 × heatmap) + 0
    # 60% original image + 40% heatmap overlay.
    # This keeps the original image visible while
    # showing the heatmap on top.
    # Doctor can see both the lesion AND the highlighted area.

    # Step 5: Save the overlay image to disk
    os.makedirs(settings.HEATMAPS_DIR, exist_ok=True)
    # Create the heatmaps directory if it does not exist.
    # exist_ok=True means no error if already exists.

    filename = f"case_{case_id}_heatmap.jpg"
    full_path = os.path.join(
        settings.HEATMAPS_DIR, filename)
    # e.g. /Users/.../SkinSight Project/uploads/heatmaps/
    #       case_1_heatmap.jpg

    cv2.imwrite(full_path, overlay)
    # Save the blended image as JPEG.
    # cv2.imwrite returns True if successful.

    relative_path = os.path.join(
        'uploads', 'heatmaps', filename)
    # e.g. "uploads/heatmaps/case_1_heatmap.jpg"
    # We store the relative path in the database.
    # Spring Boot serves this file via WebConfig
    # at http://localhost:8080/uploads/heatmaps/case_1_heatmap.jpg

    return relative_path