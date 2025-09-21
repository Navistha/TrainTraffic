from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Station(models.Model):
    """Model for railway stations"""
    name = models.CharField(max_length=100, unique=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        return self.name


class MaterialType(models.Model):
    """Model for different types of materials that can be transported"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, default='tons')  # tons, kg, liters, etc.
    is_hazardous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        return self.name


class RouteComplexity(models.Model):
    """Model to store route complexity data between stations"""
    origin = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='route_origins')
    destination = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='route_destinations')
    complexity_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('origin', 'destination')
        ordering = ['complexity_score']
        
    def __str__(self):
        return f"{self.origin} → {self.destination} (Score: {self.complexity_score})"


class Freight(models.Model):
    """Model for freight bookings"""
    STATUS_CHOICES = [
        ('free', 'Free'),
        ('booked', 'Booked'),
        ('in_transit', 'In Transit'),
        ('loading', 'Loading'),
        ('unloading', 'Unloading'), 
        ('reloading', 'Reloading'),
        ('delayed', 'Delayed'),
        ('arrived', 'Arrived'),
        ('cancelled', 'Cancelled'),
    ]
    
    freight_id = models.CharField(max_length=20, unique=True, editable=False)
    origin = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='freight_origins')
    destination = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='freight_destinations')
    material_type = models.ForeignKey(MaterialType, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='free')
    
    # Scheduling information
    scheduled_departure = models.DateTimeField()
    scheduled_arrival = models.DateTimeField(null=True, blank=True)
    actual_departure = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)
    
    # ML Prediction fields
    predicted_delay = models.BooleanField(default=False)
    delay_probability = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    route_complexity = models.IntegerField(null=True, blank=True)
    
    # Tracking information
    tracking_clicks = models.IntegerField(default=0)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        if not self.freight_id:
            import random
            self.freight_id = f"F{random.randint(1000000, 9999999)}"
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.freight_id} - {self.origin} to {self.destination}"
    
    @property
    def is_delayed(self):
        """Check if freight is actually delayed"""
        if self.actual_arrival and self.scheduled_arrival:
            return self.actual_arrival > self.scheduled_arrival
        elif self.scheduled_arrival and timezone.now() > self.scheduled_arrival and self.status != 'arrived':
            return True
        return False
