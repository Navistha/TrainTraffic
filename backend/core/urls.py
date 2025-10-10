# urls.py

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

app_name = "core"

urlpatterns = [
    # --- NEW TOKEN AUTHENTICATION URLS ---
    path("auth/token/", views.CustomTokenObtainView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # --- YOUR EXISTING URLS ---
    path("workers/", views.RailwayWorkerListView.as_view(), name="worker-list"),
    path("workers/<str:govt_id>/", views.RailwayWorkerDetailView.as_view(), name="worker-detail"),
]