from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, filters
from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from .serializer import EmployeeLoginSerializer, RailwayWorkerSerializer
from .models import RailwayWorker

class EmployeeLoginView(APIView):
    def post(self, request):
        serializer = EmployeeLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            # login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            return Response({
                "message": "Login successful",
                "employee": {
                    "work_id": user.govt_id,
                    "name": user.name,
                    "role": user.role,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
