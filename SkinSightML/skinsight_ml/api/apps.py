from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        try:
            from .ml.classifier import load_model
            load_model()
            print("✅ ResNet-50 model loaded successfully")
        except FileNotFoundError:
            print("⚠️  Model weights not found at models/")
            print("   Train the model first or download weights.")
            print("   Django will still start but /api/analyze")
            print("   will return an error until model is loaded.")
        except Exception as e:
            print(f"⚠️  Could not load model: {e}")
            print("   Django will still start.")