from django.urls import path
from .views import run_scheduler

urlpatterns = [
    path("run/", run_scheduler, name="run_scheduler"),
]
