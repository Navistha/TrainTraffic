from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
import random
import string


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
        verbose_name = 'Railway Station'
        verbose_name_plural = 'Railway Stations'
        
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
        verbose_name = 'Material Type'
        verbose_name_plural = 'Material Types'
        
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
        verbose_name = 'Route Complexity'
        verbose_name_plural = 'Route Complexities'
    
    def clean(self):
        """Validate that origin and destination are different"""
        if self.origin and self.destination and self.origin == self.destination:
            raise ValidationError("Origin and destination cannot be the same station.")
        
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
    
    freight_id = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        help_text="Automatically generated unique freight identifier"
    )
    origin = models.ForeignKey(
        Station, 
        on_delete=models.CASCADE, 
        related_name='freight_origins',
        help_text="Origin station for the freight"
    )
    destination = models.ForeignKey(
        Station, 
        on_delete=models.CASCADE, 
        related_name='freight_destinations',
        help_text="Destination station for the freight"
    )
    material_type = models.ForeignKey(
        MaterialType, 
        on_delete=models.CASCADE,
        help_text="Type of material being transported"
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0.01)],
        help_text="Quantity of material in specified units"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='free',
        help_text="Current status of the freight"
    )
    
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
        verbose_name = 'Freight Booking'
        verbose_name_plural = 'Freight Bookings'
        
    def clean(self):
        """Validate freight booking data"""
        if self.origin and self.destination and self.origin == self.destination:
            raise ValidationError("Origin and destination cannot be the same station.")
        
        if self.scheduled_arrival and self.scheduled_departure:
            if self.scheduled_arrival <= self.scheduled_departure:
                raise ValidationError("Scheduled arrival must be after scheduled departure.")
        
        if self.actual_arrival and self.actual_departure:
            if self.actual_arrival <= self.actual_departure:
                raise ValidationError("Actual arrival must be after actual departure.")
    
    def _generate_unique_freight_id(self):
        """Generate a unique freight ID with retries to prevent collisions"""
        for _ in range(10):  # Try up to 10 times
            # Generate a more unique ID with timestamp and random components
            timestamp = timezone.now().strftime('%y%m%d')
            random_chars = ''.join(random.choices(string.digits, k=4))
            freight_id = f"F{timestamp}{random_chars}"
            
            if not Freight.objects.filter(freight_id=freight_id).exists():
                return freight_id
        
        # Fallback to original method if all attempts fail
        return f"F{random.randint(100000000, 999999999)}"
    
    def save(self, *args, **kwargs):
        if not self.freight_id:
            self.freight_id = self._generate_unique_freight_id()
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
