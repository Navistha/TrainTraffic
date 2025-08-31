from django.urls import path
from .views import predict_delay_api

urlpatterns = [
    path("predict-delay/", predict_delay_api, name="predict-delay"),
]
