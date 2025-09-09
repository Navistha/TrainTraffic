from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login
from .serializer import EmployeeLoginSerializer

class EmployeeLoginView(APIView):
    def post(self, request):
        serializer = EmployeeLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            #login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            return Response({
                "message": "Login successful",
                "employee": {
                    "id": user.govt_id,
                    "name": user.name,
                    "role": user.role,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
