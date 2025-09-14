from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import RealTimeDelay
from core.serializer  import RealTimeDelaySerializer
from .predict import predict_delay

predictor = predict_delay

class PredictTrainDelay(APIView):
    def post(self, request):
        """
        Expects JSON:
        {
            "train_number": "12345",
            "station_code": "NDLS",
            "day_of_week": 2,
            "month": 9,
            "scheduled_hour": 14,
            "weather": 1,
            "distance_km": 320,
            "scheduled_arrival": "2025-09-08T14:00:00Z"
        }
        """
        try:
            features = [
    [
        request.data["track_status"],
        request.data["weather_impact"],
        request.data["train_type"],
        request.data["priority_level"],
        request.data["coach_length"],
        request.data["max_speed_kmph"]
    ]
]


            prediction = predict_delay(features)

            record = RealTimeDelay.objects.create(
                train_number=request.data["train_number"],
                station_code=request.data["station_code"],
                scheduled_arrival=request.data["scheduled_arrival"],
                predicted_delay=prediction
            )

            return Response(RealTimeDelaySerializer(record).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
