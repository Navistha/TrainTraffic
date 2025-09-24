from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ScheduleResult
from .serializers import ScheduleResultSerializer
from .model import scheduler_optimization
import os


class ScheduleResultViewSet(viewsets.ModelViewSet):
    queryset = ScheduleResult.objects.all()
    serializer_class = ScheduleResultSerializer


@api_view(["POST"])
def run_scheduler(request):
    """
    Run optimization and save schedule results into DB.
    Expected body: {"limit_trains": 10, "time_limit_s": 20 }
    """
    data_root = request.data.get("data_root", os.path.join(settings.BASE_DIR, "datasets"))
    limit_trains = request.data.get("limit_trains")
    time_limit_s = int(request.data.get("time_limit_s", 20))

    res = scheduler_optimization.optimize(
        data_root=data_root,
        limit_trains=limit_trains,
        time_limit_s=time_limit_s,
    )

    # clear previous results
    ScheduleResult.objects.all().delete()

    # save new schedule
    for tid, tinfo in res.get("trains", {}).items():
        for seg in tinfo.get("schedule", []):
            ScheduleResult.objects.create(
                train_id=tid,
                track_id=seg["track_id"],
                from_station=seg["from"],
                to_station=seg["to"],
                start_min=seg["start_min"],
                end_min=seg["end_min"],
                duration_min=seg["duration_min"],
                priority=tinfo["priority"],
            )

    return Response(res)
