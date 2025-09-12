from rest_framework import serializers
from .models import ScheduleResult


class ScheduleResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleResult
        fields = "__all__"
