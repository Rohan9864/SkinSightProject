from django.shortcuts import render

# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    AnalyzeRequestSerializer,
    AnalyzeResponseSerializer,
    HealthResponseSerializer
)


class HealthView(APIView):
    
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
        return Response(serializer.data,
                        status=status.HTTP_200_OK)


class AnalyzeView(APIView):
    # POST /api/analyze/
    # Main endpoint — receives image path from
    # Spring Boot and returns ML analysis result.
    # Full implementation comes after we build
    # the ML pipeline modules.

    def post(self, request):
        # Step 1: Validate incoming request
        serializer = AnalyzeRequestSerializer(
            data=request.data)

        if not serializer.is_valid():
            # Return validation errors to Spring Boot
            return Response(
                {
                    'case_id': request.data.get(
                        'case_id', 0),
                    'predicted_class': None,
                    'confidence_scores': None,
                    'heatmap_url': None,
                    'severity_score': None,
                    'severity_level': None,
                    'success': False,
                    'error_message': str(
                        serializer.errors)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ML pipeline will be called here
        # after we build the pipeline modules.
        # For now return a placeholder response.
        return Response(
            {
                'case_id': serializer.validated_data[
                    'case_id'],
                'predicted_class': None,
                'confidence_scores': None,
                'heatmap_url': None,
                'severity_score': None,
                'severity_level': None,
                'success': False,
                'error_message':
                    'ML pipeline not implemented yet.'
            },
            status=status.HTTP_501_NOT_IMPLEMENTED
        )
