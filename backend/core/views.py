from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, filters
from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from .serializer import  RailwayWorkerSerializer
from .models import RailwayWorker

class EmployeeLoginView(APIView):
    def post(self, request):
        govt_id = request.data.get("govt_id")
        name = request.data.get("name")
        role = request.data.get("role")

        try:
            employee = RailwayWorker.objects.get(govt_id=govt_id, name=name, role=role)
        except RailwayWorker.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({
            "message": "Login successful",
            "employee": {
                "govt_id": employee.govt_id,
                "name": employee.name,
                "role": employee.role,
            }
        }, status=status.HTTP_200_OK)




class RailwayWorkerListView(generics.ListAPIView):
    queryset = RailwayWorker.objects.all()
    serializer_class = RailwayWorkerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["govt_id", "name", "designation", "department", "assigned_station"]
    ordering_fields = ["name", "designation", "department"]
    ordering = ["name"]


class RailwayWorkerDetailView(generics.RetrieveAPIView):
    queryset = RailwayWorker.objects.all()
    serializer_class = RailwayWorkerSerializer
    lookup_field = "govt_id"
