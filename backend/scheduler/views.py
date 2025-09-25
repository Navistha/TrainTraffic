from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ScheduleResult
from .serializers import ScheduleResultSerializer
from .model import scheduler_optimization
import os
import csv


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

    # logic to write the same results to a CSV file
    try:
        output_path = os.path.join(settings.BASE_DIR, "datasets", "schedules", "schedule_output.csv")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Prepare data for CSV
        rows = []
        for train_id, train_info in res.get("trains", {}).items():
            for segment in train_info.get("schedule", []):
                row_data = {
                    'train_id': train_id,
                    'priority': train_info.get('priority'),
                    'release_delay_min': train_info.get('release_delay_min'),
                    'track_id': segment.get('track_id'),
                    'from_station': segment.get('from'),
                    'to_station': segment.get('to'),
                    'from_name': segment.get('from_name'),
                    'to_name': segment.get('to_name'),
                    'start_min': segment.get('start_min'),
                    'end_min': segment.get('end_min'),
                    'duration_min': segment.get('duration_min'),
                    'start_time': segment.get('start_time'),
                    'end_time': segment.get('end_time'),
                }
                rows.append(row_data)

        # Write to CSV file, overwriting it if it exists
        if rows:
            with open(output_path, 'w', newline='') as csvfile:
                fieldnames = rows[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                writer.writerows(rows)
            
            # Add a success message to the response
            res['csv_export_status'] = f"Successfully wrote {len(rows)} segments to {output_path}"
    except Exception as e:
        # Add an error message to the response if CSV writing fails
        res['csv_export_status'] = f"Error writing to CSV: {str(e)}"

    return Response(res)
