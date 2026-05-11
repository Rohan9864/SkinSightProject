# api/ml/gradcam.py

import cv2
import numpy as np
import torch
import torch.nn as nn
import os
from django.conf import settings

IMAGE_SIZE = 384
# Must match preprocessor.py IMAGE_SIZE.
# Grad-CAM overlay is resized to match the
# input image size used during inference.


class GradCAM:
    """
    Grad-CAM for ConvNeXt-Base.
    Target: model[0].stages[3].blocks[-1]
    Last ConvNeXt block before global pooling.
    """

    def __init__(self, model):
        self.model       = model
        self.gradients   = None
        self.activations = None
        self.hooks       = []
        self._register_hooks()

    def _register_hooks(self):
        """
        Hooks into last block of ConvNeXt stage 3.
        Output shape at 384×384:
            (B, 1024, 12, 12) — richer spatial detail
            than 224×224 which gives (B, 1024, 7, 7).
        """
        target_layer = \
            self.model[0].stages[3].blocks[-1]

        def forward_hook(module, input, output):
            self.activations = output.detach()
            # Shape: (1, 1024, 12, 12) at 384×384 input

        def backward_hook(module,
                           grad_input, grad_output):
            self.gradients = grad_output[0].detach()
            # Shape: (1, 1024, 12, 12)

        fwd = target_layer.register_forward_hook(
            forward_hook)
        bwd = target_layer.register_full_backward_hook(
            backward_hook)
        self.hooks.extend([fwd, bwd])

    def remove_hooks(self):
        for hook in self.hooks:
            hook.remove()
        self.hooks = []

    def generate(self, tensor, class_index):
        """
        Generates Grad-CAM activation map.

        Args:
            tensor (torch.Tensor): (1, 3, 384, 384)
            class_index (int): Predicted class index.

        Returns:
            numpy.ndarray: (384, 384) float, values 0-1.
        """
        self.model.zero_grad()

        outputs     = self.model(tensor)
        class_score = outputs[0, class_index]
        class_score.backward()

        # Global average pool gradients
        weights = self.gradients.mean(
            dim=[2, 3], keepdim=True)
        # (1, 1024, 12, 12) → (1, 1024, 1, 1)

        # Weighted sum of feature maps
        cam = (weights * self.activations).sum(
            dim=1, keepdim=True)
        # (1, 1024, 12, 12) → (1, 1, 12, 12)

        cam = torch.relu(cam)

        cam = cam.squeeze().cpu().numpy()
        # (12, 12) — richer than (7,7) from 224 input

        # Normalize
        cam_min = cam.min()
        cam_max = cam.max()
        if cam_max - cam_min > 1e-8:
            cam = (cam - cam_min) / (
                cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        # Resize to 384×384
        cam = cv2.resize(cam, (IMAGE_SIZE, IMAGE_SIZE))
        # Upsample 12×12 → 384×384.
        # Higher resolution Grad-CAM because of
        # the larger 12×12 spatial grid vs 7×7.

        return cam


def generate_heatmap(model, tensor, original_rgb,
                      class_index, case_id):
    """
    Generates and saves Grad-CAM heatmap overlay.

    Args:
        model: Loaded ConvNeXt-Base model.
        tensor: (1, 3, 384, 384)
        original_rgb: CLAHE-enhanced RGB (H, W, 3)
        class_index (int): Predicted class index.
        case_id (int): Case ID for filename.

    Returns:
        str: e.g. "uploads/heatmaps/case_1_heatmap.jpg"
    """

    grad_cam = GradCAM(model)
    cam      = grad_cam.generate(tensor, class_index)
    grad_cam.remove_hooks()

    # Convert to color heatmap
    cam_uint8 = np.uint8(255 * cam)
    heatmap   = cv2.applyColorMap(
        cam_uint8, cv2.COLORMAP_JET)

    # Convert original RGB → BGR for OpenCV
    original_bgr = cv2.cvtColor(
        original_rgb, cv2.COLOR_RGB2BGR)

    # Resize both to 384×384
    original_bgr = cv2.resize(
        original_bgr, (IMAGE_SIZE, IMAGE_SIZE))
    heatmap      = cv2.resize(
        heatmap, (IMAGE_SIZE, IMAGE_SIZE))

    # Blend 60% original + 40% heatmap
    overlay = cv2.addWeighted(
        original_bgr, 0.6,
        heatmap, 0.4,
        0)

    # Save
    os.makedirs(settings.HEATMAPS_DIR, exist_ok=True)
    filename      = f"case_{case_id}_heatmap.jpg"
    full_path     = os.path.join(
        settings.HEATMAPS_DIR, filename)
    relative_path = os.path.join(
        'uploads', 'heatmaps', filename)

    cv2.imwrite(full_path, overlay)
    return relative_path