"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from ml.views import PredictTrainDelay
# REMOVE THIS IMPORT: from core.views import EmployeeLoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/predict-delay/", PredictTrainDelay.as_view(), name="predict-delay"),
    
    # REMOVE THIS LINE for the old login
    # path("login/",EmployeeLoginView.as_view(), name="employee_login"), 
    
    # These lines are correct
    path("api/scheduler/", include("scheduler.urls")),
    path('decision-center/', include('decision_engine.urls')),
    path('api/booking/', include('booking.urls')),
    
    # This line correctly includes all URLs from your core app, including the new login
    path('api/core/', include('core.urls')), 
]