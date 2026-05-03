# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    AnalyzeRequestSerializer,
    AnalyzeResponseSerializer,
    HealthResponseSerializer
)
from .ml.pipeline import run_pipeline
import traceback


class HealthView(APIView):
    """GET /api/health/ — health check endpoint."""

    def get(self, request):

        try:
            from .ml.classifier import MODEL
            model_loaded = MODEL is not None
        except Exception:
            model_loaded = False

        data = {
            'status': 'ok',
            'model_loaded': model_loaded,
            'message': (
                'Model loaded. Ready to analyze images.'
                if model_loaded
                else 'Model not loaded. Train first.'
            )
        }

        serializer = HealthResponseSerializer(data)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK)


class AnalyzeView(APIView):
    """POST /api/analyze/ — main ML analysis endpoint."""

    def post(self, request):

        # ── Step 1: Validate incoming request ─────────────────
        serializer = AnalyzeRequestSerializer(
            data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    'case_id': request.data.get(
                        'case_id', 0),
                    'predicted_class':   None,
                    'confidence_scores': None,
                    'heatmap_url':       None,
                    'severity_score':    None,
                    'severity_level':    None,
                    'success':           False,
                    'error_message': str(
                        serializer.errors)
                },
                status=status.HTTP_400_BAD_REQUEST)

        case_id   = serializer.validated_data['case_id']
        image_url = serializer.validated_data['image_url']

        # ── Step 2: Run ML pipeline ────────────────────────────
        try:
            result = run_pipeline(case_id, image_url)
            # run_pipeline() runs all 4 steps:
            # preprocess → classify → gradcam → severity

            response_serializer = \
                AnalyzeResponseSerializer(result)
            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK)

        except FileNotFoundError as e:
            # Image file does not exist on disk
            return Response(
                {
                    'case_id':           case_id,
                    'predicted_class':   None,
                    'confidence_scores': None,
                    'heatmap_url':       None,
                    'severity_score':    None,
                    'severity_level':    None,
                    'success':           False,
                    'error_message': str(e)
                },
                status=status.HTTP_404_NOT_FOUND)

        except RuntimeError as e:
            # Model not loaded
            return Response(
                {
                    'case_id':           case_id,
                    'predicted_class':   None,
                    'confidence_scores': None,
                    'heatmap_url':       None,
                    'severity_score':    None,
                    'severity_level':    None,
                    'success':           False,
                    'error_message': str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE)

        except Exception as e:
            # Any other unexpected error
            traceback.print_exc()
            # Print full stack trace to Django console
            # for debugging.
            return Response(
                {
                    'case_id':           case_id,
                    'predicted_class':   None,
                    'confidence_scores': None,
                    'heatmap_url':       None,
                    'severity_score':    None,
                    'severity_level':    None,
                    'success':           False,
                    'error_message':
                        f"Pipeline error: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)