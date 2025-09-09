from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class EmployeeManager(BaseUserManager):
    def create_user(self, work_id, password=None, **extra_fields):
        if not work_id:
            raise ValueError("Work ID is required")
        user = self.model(work_id=work_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, work_id, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(work_id, password, **extra_fields)


class Employee(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("signal_operator", "Signal Operator"),
        ("maintenance", "Maintenance Crew"),
        ("station_staff", "Station Staff"),
        ("admin", "Administrator"),
    ]

    work_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = EmployeeManager()

    USERNAME_FIELD = "work_id"
    REQUIRED_FIELDS = ["name", "role"]

    def __str__(self):
        return f"{self.name} ({self.role})"


class Station(models.Model):
    id = models.CharField(primary_key=True)
    station_code = models.CharField(max_length=10, unique=True)
    station_name = models.CharField(max_length=255)
    state = models.CharField(max_length=100, blank=True, null=True)
    platforms = models.IntegerField(default=1)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = "stations"   # map to existing Postgres table

    def __str__(self):
        return f"{self.station_name} ({self.station_code})"


class Train(models.Model):
    train_number = models.CharField(max_length=20, unique=True)
    train_name = models.CharField(max_length=255)
    source_station = models.CharField(max_length=10)
    destination_station = models.CharField(max_length=10)
    total_coaches = models.IntegerField(default=12)

    class Meta:
        db_table = "trains"

    def __str__(self):
        return f"{self.train_name} ({self.train_number})"


class Track(models.Model):
    track_id = models.AutoField(primary_key=True)
    source_station_id = models.CharField(max_length=10)
    destination_station_id = models.CharField(max_length=10)
    distance_km = models.FloatField()
    track_type = models.CharField(max_length=50, default="unknown") 
    electrification = models.BooleanField(default=False)
    speed_limit=models.IntegerField(help_text="Speed limit in km/h",default=90)
    status = models.CharField(max_length=50, default="active")  # e.g., active, under_maintenance

    class Meta:
        db_table = "tracks"

    def __str__(self):
        return f"Track {self.track_id}: {self.source_station_id} → {self.destination_station_id}"


class RailwayWorker(models.Model):
    worker_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    assigned_station = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        db_table = "railway_workers"

    def __str__(self):
        return f"{self.name} ({self.designation})"


class RealTimeDelay(models.Model):
    id = models.AutoField(primary_key=True)
    train_number = models.CharField(max_length=20)
    station_code = models.CharField(max_length=10)
    scheduled_arrival = models.DateTimeField()
    actual_arrival = models.DateTimeField(blank=True, null=True)
    delay_minutes = models.IntegerField(default=0)

    class Meta:
        db_table = "realtime_delay"

    def __str__(self):
        return f"{self.train_number} - {self.station_code} ({self.delay_minutes} min delay)"