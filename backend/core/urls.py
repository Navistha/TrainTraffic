from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("workers/", views.RailwayWorkerListView.as_view(), name="worker-list"),
    path("workers/<str:govt_id>/", views.RailwayWorkerDetailView.as_view(), name="worker-detail"),
]
