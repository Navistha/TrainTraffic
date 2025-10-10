# views.py

from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenViewBase
from .models import Employee
from .serializer import EmployeeSerializer, CustomTokenObtainSerializer

# ------------------------------------------------------------------
#  TOKEN AUTHENTICATION VIEW (This is the new part)
# ------------------------------------------------------------------
class CustomTokenObtainView(TokenViewBase):
    """
    Handles the POST request to log in and get tokens.
    """
    serializer_class = CustomTokenObtainSerializer

# ------------------------------------------------------------------
#  YOUR EXISTING VIEWS (Now protected and corrected)
# ------------------------------------------------------------------
class RailwayWorkerListView(generics.ListAPIView):
    # This view is now protected. A valid token is required to access it.
    permission_classes = [IsAuthenticated]
    
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer # Corrected serializer name
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    # Corrected search fields to match your RailwayWorker model
    search_fields = ["govt_id", "name", "role", "level", "assigned_station__station_name"]
    
    # Corrected ordering fields
    ordering_fields = ["name", "role", "level"]
    ordering = ["name"]


class RailwayWorkerDetailView(generics.RetrieveAPIView):
    # This view is also protected.
    permission_classes = [IsAuthenticated]

    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer # Corrected serializer name
    lookup_field = "govt_id"