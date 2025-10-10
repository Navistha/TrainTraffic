# serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Employee, Train, Station, Track, RealTimeDelay, Freight, Schedule
)

# ------------------------------------------------------------------
#  TOKEN AUTHENTICATION SERIALIZER (This is the new part)
# ------------------------------------------------------------------
class CustomTokenObtainSerializer(serializers.Serializer):
    """
    Custom serializer to authenticate using govt_id, name, and role.
    WARNING: This is an insecure authentication method. Use real passwords in production.
    """
    govt_id = serializers.CharField()
    name = serializers.CharField()
    role = serializers.CharField()

    def validate(self, attrs):
        govt_id = attrs.get('govt_id')
        name = attrs.get('name')
        role = attrs.get('role')

        try:
            # IMPORTANT: We authenticate against the 'Employee' user model
            user = Employee.objects.get(govt_id=govt_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        # Check if the name and role match
        if user.name.lower() != name.lower() or user.role != role:
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")

        # If credentials are valid, generate tokens
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

# ------------------------------------------------------------------
#  YOUR EXISTING MODEL SERIALIZERS
# ------------------------------------------------------------------
class EmployeeSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class Meta:
        model = Employee
        fields = ['id', 'govt_id', 'name', 'role', 'role_display', 'is_active', 'is_staff']

class TrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Train
        fields = "__all__"

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = "__all__"

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"

class RealTimeDelaySerializer(serializers.ModelSerializer):
    class Meta:
        model = RealTimeDelay
        fields = "__all__"