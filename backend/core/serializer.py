from rest_framework import serializers
from .models import RealTimeDelay, Train, Station, Track, RailwayWorker, Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"

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
    work_id = serializers.CharField()
    role = serializers.CharField()   

    def validate(self, data):
        work_id = data.get("work_id")
        role = data.get("role")

        try:
            user = RailwayWorker.objects.get(govt_id=work_id)
        except RailwayWorker.DoesNotExist:
            raise serializers.ValidationError("Invalid work_id")

        if user.role != role:
            raise serializers.ValidationError("Invalid role (password)")

        data["user"] = user
        return data
