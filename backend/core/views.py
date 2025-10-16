from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, filters
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from .serializer import RailwayWorkerSerializer, EmployeeLoginSerializer, EmployeeSerializer
from .models import RailwayWorker, Employee


class EmployeeLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        govt_id = request.data.get("govt_id")
        name = request.data.get("name")
        role = request.data.get("role")

        try:
            employee = RailwayWorker.objects.get(
                govt_id=govt_id, name=name, role=role)
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


class EmployeeTokenLoginView(APIView):
    permission_classes = [AllowAny]
    """Login endpoint that returns an auth token for SPA use.

    Expects: { govt_id, name, role }
    Returns: { token, user: { govt_id, name, role } }
    """

    def post(self, request):
        # Debug: log incoming payload (will appear in server console)
        try:
            print("[EmployeeTokenLoginView] login payload:", request.data)
        except Exception:
            pass

        serializer = EmployeeLoginSerializer(data=request.data)
        if not serializer.is_valid():
            # Return validation errors explicitly
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data.get("user")

        if user is None:
            return Response({"detail": "User not found after validation."}, status=status.HTTP_400_BAD_REQUEST)

        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        user_data = EmployeeSerializer(user).data

        return Response({
            "access": access_token,
            "refresh": refresh_token,
            "user": user_data,
        }, status=status.HTTP_200_OK)


class EmployeeProfileView(APIView):
    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(EmployeeSerializer(user).data)


class RailwayWorkerListView(generics.ListAPIView):
    queryset = RailwayWorker.objects.all()
    serializer_class = RailwayWorkerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["govt_id", "name", "designation",
                     "department", "assigned_station"]
    ordering_fields = ["name", "designation", "department"]
    ordering = ["name"]


class RailwayWorkerDetailView(generics.RetrieveAPIView):
    queryset = RailwayWorker.objects.all()
    serializer_class = RailwayWorkerSerializer
    lookup_field = "govt_id"
