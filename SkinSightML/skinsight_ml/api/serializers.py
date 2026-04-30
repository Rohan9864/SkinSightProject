from rest_framework import serializers

class AnalyzeRequestSerializer(serializers.Serializer):

    case_id = serializers.IntegerField()

    image_url = serializers.CharField(
        max_length=500)

    def validate_case_id(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "case_id must be a positive integer.")
        return value

    def validate_image_url(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "image_url cannot be empty.")
        return value


class AnalyzeResponseSerializer(serializers.Serializer):

    case_id = serializers.IntegerField()
    predicted_class = serializers.CharField(
        allow_null=True,
        required=False)

    confidence_scores = serializers.CharField(
        allow_null=True,
        required=False)
   
    heatmap_url = serializers.CharField(
        allow_null=True,
        required=False)
    
    severity_score = serializers.FloatField(
        allow_null=True,
        required=False)

    severity_level = serializers.CharField(
        allow_null=True,
        required=False)
    success = serializers.BooleanField()
    
    error_message = serializers.CharField(
        allow_null=True,
        required=False,
        default=None)
    
class HealthResponseSerializer(serializers.Serializer):

    status = serializers.CharField()
   
    model_loaded = serializers.BooleanField()
   
    message = serializers.CharField(
        required=False,
        allow_null=True)