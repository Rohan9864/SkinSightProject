import os
from pathlib import Path
from dotenv import load_dotenv

# ── Load .env file ────────────────────────────────────────────
load_dotenv()
# Reads .env file from the project root and loads
# all variables into the environment.
# This is the Python equivalent of spring-dotenv.

# ── Base directory ────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
# Points to the skinsight_ml/ project root folder.
# All relative paths are resolved from here.

# ── Security ──────────────────────────────────────────────────
SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'fallback-secret-key-for-development-only')
# Read from .env file.
# os.getenv(key, default) returns the default
# if the variable is not set in .env.

DEBUG = os.getenv('DEBUG', 'True') == 'True'
# DEBUG=True shows detailed error pages.
# Set to False in production.
# os.getenv returns a string so we compare to 'True'.

ALLOWED_HOSTS = os.getenv(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1').split(',')
# Comma-separated hosts that can access this server.
# .split(',') converts "localhost,127.0.0.1"
# into ['localhost', '127.0.0.1']

# ── Installed apps ────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    # Django REST Framework — gives us serializers,
    # APIView, Response, and status codes.
    'api',
    # Our ML app where all the logic lives.
]

# ── Middleware ────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # Note: CsrfViewMiddleware is removed.
    # We disable CSRF because this is a pure API
    # called by Spring Boot, not a browser.
    # Spring Boot is not a browser and cannot
    # send CSRF tokens.
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ── URL configuration ─────────────────────────────────────────
ROOT_URLCONF = 'skinsight_ml.urls'
# Points to skinsight_ml/urls.py for URL routing.

# ── Templates (minimal — we return JSON only) ─────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'skinsight_ml.wsgi.application'

# ── Database (minimal — we do not store anything) ─────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
# We use SQLite as a minimal database.
# Django requires a database even if we do not use it.
# SQLite needs no setup — Django creates the file automatically.
# We never actually write anything to this database.

# ── DRF Configuration ─────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    # Only render JSON — no HTML browsable API.
    # This is a pure API service.

    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    # Only parse JSON request bodies.
    # Spring Boot sends JSON, we parse JSON.

    'DEFAULT_AUTHENTICATION_CLASSES': [],
    # No authentication required.
    # This service is only accessible from
    # Spring Boot on localhost.

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    # Allow all requests.
    # No login required to call this API.
}

# ── File paths ────────────────────────────────────────────────
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
# Base uploads directory shared with Spring Boot.
# Spring Boot saves images here.
# Django reads images from here.

CASES_DIR = os.path.join(UPLOAD_DIR, 'cases')
# Where Spring Boot saves patient images.
# e.g. uploads/cases/patient_1_1704067200000.jpg

HEATMAPS_DIR = os.path.join(UPLOAD_DIR, 'heatmaps')
# Where Django saves Grad-CAM heatmap images.
# e.g. uploads/heatmaps/case_1_heatmap.jpg

MODEL_PATH = os.path.join(
    BASE_DIR, 'models', 'resnet50_skinsight.pth')
# Path to trained ResNet-50 weights.
# This file is generated after training on ISIC 2019.
# Added to .gitignore because it is too large for GitHub.

# ── Internationalization ──────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ── Static files ──────────────────────────────────────────────
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Spring Boot URL (for reference) ──────────────────────────
SPRING_BOOT_URL = os.getenv(
    'SPRING_BOOT_URL',
    'http://localhost:8080')
# Not used for API calls but useful for logging
# and knowing which Spring Boot instance to work with.