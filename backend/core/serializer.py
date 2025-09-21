from rest_framework import serializers
from .models import RealTimeDelay, Train, Station, Track, RailwayWorker, Employee

class EmployeeSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'work_id', 'name', 'role', 'role_display', 
            'is_active', 'is_staff', 'last_login'
        ]
        read_only_fields = ['id', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True},
        }

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

class RailwayWorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RailwayWorker
        fields = "__all__"

class RealTimeDelaySerializer(serializers.ModelSerializer):
    class Meta:
        model = RealTimeDelay
        fields = "__all__"

class EmployeeLoginSerializer(serializers.Serializer):
    work_id = serializers.CharField(help_text="Employee Work ID")
    role = serializers.CharField(help_text="Employee role")

    def validate(self, data):
        work_id = data.get("work_id")
        role = data.get("role")

        try:
            user = Employee.objects.get(work_id=work_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Invalid work ID")

        if user.role != role:
            raise serializers.ValidationError("Invalid role")

        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")

        data["user"] = user
        return data
