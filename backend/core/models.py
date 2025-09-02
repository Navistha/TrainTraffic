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

