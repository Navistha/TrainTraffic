from rest_framework.decorators import api_view
from rest_framework.response import Response
from .delay_prediction import predict_delay

@api_view(["POST"])
def predict_delay_api(request):
    data = request.data
    scheduled_arrival = data.get("scheduled_arrival")
    actual_arrival = data.get("actual_arrival")
    weather = data.get("weather")
    section = data.get("section")

    delay = predict_delay(scheduled_arrival, actual_arrival, weather, section)
    return Response({"predicted_delay_minutes": delay})
