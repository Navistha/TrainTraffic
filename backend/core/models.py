from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# This custom user model for system authentication remains unchanged.


class EmployeeManager(BaseUserManager):
    def create_user(self, govt_id, password=None, **extra_fields):
        """Create and save a User with the given govt_id and password."""
        if not govt_id:
            raise ValueError("Govt ID is required")
        user = self.model(govt_id=govt_id, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, govt_id, password=None, **extra_fields):
        """Create and save a superuser with the given govt_id and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(govt_id, password, **extra_fields)


class Employee(AbstractBaseUser, PermissionsMixin):
    # ... (model remains the same)
    ROLE_CHOICES = [
        ("station_master", "Station Master"),
        ("section_controller", "Section Controller"),
        ("freight_operator", "Freight Operator"),
        ("track_manager", "Track Manager"),
    ]
    govt_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = EmployeeManager()
    USERNAME_FIELD = "govt_id"
    REQUIRED_FIELDS = ["name", "role"]

    def __str__(self):
        return f"{self.name} ({self.role})"


# Mapped to stations.csv
class Station(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    station_code = models.CharField(max_length=10, unique=True)
    station_name = models.CharField(max_length=255)
    division = models.CharField(max_length=100, blank=True, null=True)  # ADDED
    state = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    platforms = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.station_name} ({self.station_code})"

# Mapped to trains.csv


class Train(models.Model):
    train_id = models.CharField(
        primary_key=True, max_length=255)  # CHANGED to primary key
    train_number = models.CharField(max_length=20, unique=True)
    train_name = models.CharField(max_length=255)
    train_type = models.CharField(
        max_length=50, blank=True, null=True)  # ADDED
    priority_level = models.CharField(
        max_length=50, blank=True, null=True)  # ADDED
    scheduled_route = models.TextField(blank=True, null=True)  # ADDED
    coach_length = models.IntegerField(
        default=12)  # RENAMED from total_coaches
    max_speed_kmph = models.IntegerField(blank=True, null=True)  # ADDED
    # REMOVED source_station and destination_station as they are not in the new CSV.

    def __str__(self):
        return f"{self.train_name} ({self.train_number})"

# Mapped to tracks.csv


class Track(models.Model):
    # This model matches your new CSV structure well.
    track_id = models.CharField(primary_key=True, max_length=255)
    source_station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="tracks_from")
    destination_station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="tracks_to")
    distance_km = models.FloatField()
    track_type = models.CharField(max_length=50, default="unknown")
    electrification = models.BooleanField(default=False)
    speed_limit = models.IntegerField(
        help_text="Speed limit in km/h", default=90)
    status = models.CharField(max_length=50, default="active")

    def __str__(self):
        return f"Track {self.track_id}: {self.source_station.station_code} → {self.destination_station.station_code}"

# Mapped to railway_worker.csv


class RailwayWorker(models.Model):
    govt_id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)  # CHANGED from designation
    level = models.CharField(max_length=50, blank=True, null=True)  # ADDED
    assigned_station = models.ForeignKey(
        Station, on_delete=models.SET_NULL, blank=True, null=True)
    # REMOVED department as it's not in the new CSV.

    def __str__(self):
        return f"{self.name} ({self.role})"

# Mapped to traindelay.csv (replaces the old RealTimeDelay model)


class RealTimeDelay(models.Model):
    train = models.ForeignKey(Train, on_delete=models.CASCADE)
    current_station = models.ForeignKey(Station, on_delete=models.CASCADE)
    actual_arrival_time = models.DateTimeField(blank=True, null=True)
    actual_departure_time = models.DateTimeField(blank=True, null=True)
    delay_minutes = models.IntegerField(default=0)
    track_status = models.CharField(max_length=100, blank=True, null=True)
    weather_impact = models.CharField(max_length=100, blank=True, null=True)
    train_type = models.CharField(max_length=50, blank=True, null=True)
    priority_level = models.CharField(max_length=50, blank=True, null=True)
    coach_length = models.FloatField(blank=True, null=True)
    max_speed_kmph = models.FloatField(blank=True, null=True)
    delayed_flag = models.BooleanField(default=False)

    def __str__(self):
        return f"Delay for {self.train.train_number} at {self.current_station.station_code}"

# NEW MODEL: Mapped to freights.csv


class Freight(models.Model):
    freight_id = models.CharField(primary_key=True, max_length=255)
    current_station = models.ForeignKey(Station, on_delete=models.CASCADE)
    actual_arrival_time = models.DateTimeField(blank=True, null=True)
    actual_departure_time = models.DateTimeField(blank=True, null=True)
    delay_minutes = models.IntegerField(default=0)
    track_status = models.CharField(max_length=100, blank=True, null=True)
    weather_impact = models.CharField(max_length=100, blank=True, null=True)
    freight_type = models.CharField(max_length=50, blank=True, null=True)
    priority_level = models.CharField(max_length=50, blank=True, null=True)
    coach_length = models.IntegerField(blank=True, null=True)
    max_speed_kmph = models.IntegerField(blank=True, null=True)
    delayed_flag = models.BooleanField(default=False)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"Freight {self.freight_id} at {self.current_station.station_code}"

# NEW MODEL: Mapped to schedule_output.csv


class Schedule(models.Model):
    train = models.ForeignKey(Train, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    from_station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="schedule_departures")
    to_station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="schedule_arrivals")
    priority = models.CharField(max_length=50, blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_min = models.IntegerField()

    def __str__(self):
        return f"Schedule: {self.train.train_number} on {self.track.track_id}"
