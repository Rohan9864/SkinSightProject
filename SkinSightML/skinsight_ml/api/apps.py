from django.apps import AppConfig
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # RUN_MAIN is set only in the child process.
        # This prevents the model from loading twice
        # during development with StatReloader.
        if os.environ.get('RUN_MAIN') != 'true':
            return
        # Only the child process (RUN_MAIN=true)
        # actually handles requests.
        # Parent process just watches for file changes.

        try:
            from .ml.classifier import load_model
            load_model()
            print("✅ ConvNeXt-Base model loaded successfully.")
            print("   Ready to analyze skin lesion images.")
        except FileNotFoundError:
            print("⚠️  Model not found.")
            print("   Expected: models/convnext_base_90pct.pth")
        except Exception as e:
            print(f"⚠️  Model load error: {e}")