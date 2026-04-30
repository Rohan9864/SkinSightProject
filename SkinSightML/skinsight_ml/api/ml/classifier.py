import os
from django.conf import settings

def load_model():
    model_path = settings.MODEL_PATH

    if not os.path.exists(model_path):
        raise FileNotFoundError

    print("Model found!")  # temporary