from django.db import models


class ScheduleResult(models.Model):
    train_id = models.CharField(max_length=20)
    track_id = models.CharField(max_length=20)
    from_station = models.CharField(max_length=20)
    to_station = models.CharField(max_length=20)
    start_min = models.IntegerField()
    end_min = models.IntegerField()
    duration_min = models.IntegerField()
    priority = models.IntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.train_id} -> {self.track_id} ({self.start_min}-{self.end_min})"
