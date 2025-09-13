from django.db import models
from django.contrib.auth import get_user_model
from core.models import Train, Track, Station
import json

Employee = get_user_model()


class DecisionType(models.TextChoices):
    PRECEDENCE = 'precedence', 'Train Precedence'
    PLATFORM_ASSIGNMENT = 'platform_assignment', 'Platform Assignment'
    DELAY_RECOVERY = 'delay_recovery', 'Delay Recovery'
    ROUTE_OPTIMIZATION = 'route_optimization', 'Route Optimization'
    CONFLICT_RESOLUTION = 'conflict_resolution', 'Conflict Resolution'


class DecisionPriority(models.TextChoices):
    HIGH = 'high', 'High Priority'
    MEDIUM = 'medium', 'Medium Priority'
    LOW = 'low', 'Low Priority'


class DecisionStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACCEPTED = 'accepted', 'Accepted'
    MODIFIED = 'modified', 'Modified'
    OVERRIDDEN = 'overridden', 'Overridden'
    EXPIRED = 'expired', 'Expired'


class Decision(models.Model):
    """
    Main decision model representing operational decisions that need to be made
    """
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    decision_type = models.CharField(max_length=50, choices=DecisionType.choices)
    priority = models.CharField(max_length=20, choices=DecisionPriority.choices, default=DecisionPriority.MEDIUM)
    status = models.CharField(max_length=20, choices=DecisionStatus.choices, default=DecisionStatus.PENDING)
    
    # Related entities
    trains_involved = models.JSONField(default=list, help_text="List of train IDs involved")
    tracks_involved = models.JSONField(default=list, help_text="List of track IDs involved") 
    stations_involved = models.JSONField(default=list, help_text="List of station codes involved")
    
    # Timing
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateTimeField(null=True, blank=True, help_text="Decision deadline")
    time_remaining = models.IntegerField(null=True, blank=True, help_text="Minutes remaining to decide")
    
    # Decision maker
    assigned_controller = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    decided_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='decisions_made')
    decided_at = models.DateTimeField(null=True, blank=True)
    
    # Context data
    context_data = models.JSONField(default=dict, help_text="Additional context for the decision")
    
    class Meta:
        db_table = 'decisions'
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_priority_display()})"
    
    def get_time_remaining_minutes(self):
        if self.deadline:
            from django.utils import timezone
            remaining = (self.deadline - timezone.now()).total_seconds() / 60
            return max(0, int(remaining))
        return self.time_remaining


class AIRecommendation(models.Model):
    """
    AI-generated recommendations for decisions
    """
    decision = models.OneToOneField(Decision, on_delete=models.CASCADE, related_name='ai_recommendation')
    recommendation_text = models.TextField(help_text="Main recommendation text")
    confidence_score = models.FloatField(help_text="AI confidence percentage (0-100)")
    
    # Reasoning
    reasoning_points = models.JSONField(default=list, help_text="List of reasoning points")
    
    # Expected impacts
    delay_reduction_min = models.FloatField(null=True, blank=True, help_text="Expected delay reduction in minutes")
    energy_saving_percent = models.FloatField(null=True, blank=True, help_text="Expected energy saving percentage")
    passengers_affected = models.IntegerField(null=True, blank=True, help_text="Number of passengers affected")
    throughput_improvement_percent = models.FloatField(null=True, blank=True, help_text="Throughput improvement percentage")
    
    # ML model info
    model_version = models.CharField(max_length=50, null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    # Alternative options
    alternative_options = models.JSONField(default=list, help_text="List of alternative recommendations")
    
    class Meta:
        db_table = 'ai_recommendations'
    
    def __str__(self):
        return f"AI Recommendation for {self.decision.title} ({self.confidence_score}%)"
    
    def get_impact_summary(self):
        impacts = {}
        if self.delay_reduction_min is not None:
            impacts['Delay Reduction'] = f"{self.delay_reduction_min:+.1f} min"
        if self.energy_saving_percent is not None:
            impacts['Energy Saving'] = f"{self.energy_saving_percent:+.1f}%"
        if self.passengers_affected is not None:
            impacts['Passengers Affected'] = f"{self.passengers_affected:,}"
        if self.throughput_improvement_percent is not None:
            impacts['Throughput'] = f"{self.throughput_improvement_percent:+.1f}%"
        return impacts


class DecisionAction(models.Model):
    """
    Actions taken on decisions (accept, modify, override)
    """
    ACTION_CHOICES = [
        ('accept', 'Accept Recommendation'),
        ('modify', 'Modify Recommendation'),
        ('override', 'Override Recommendation'),
    ]
    
    decision = models.ForeignKey(Decision, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    action_by = models.ForeignKey(Employee, on_delete=models.CASCADE)
    action_at = models.DateTimeField(auto_now_add=True)
    
    # Modification details
    modified_recommendation = models.TextField(null=True, blank=True)
    override_reason = models.TextField(null=True, blank=True)
    custom_parameters = models.JSONField(default=dict, help_text="Custom parameters for modified recommendation")
    
    # Results tracking
    actual_delay_impact = models.FloatField(null=True, blank=True, help_text="Actual delay impact in minutes")
    actual_energy_impact = models.FloatField(null=True, blank=True, help_text="Actual energy impact percentage")
    
    class Meta:
        db_table = 'decision_actions'
        ordering = ['-action_at']
    
    def __str__(self):
        return f"{self.get_action_type_display()} - {self.decision.title}"


class DecisionAnalytics(models.Model):
    """
    Analytics and performance tracking for decisions
    """
    decision = models.OneToOneField(Decision, on_delete=models.CASCADE, related_name='analytics')
    
    # Performance metrics
    decision_time_seconds = models.IntegerField(null=True, blank=True, help_text="Time taken to make decision")
    recommendation_accuracy = models.FloatField(null=True, blank=True, help_text="How accurate was the AI recommendation")
    
    # Outcome metrics
    actual_delay_impact = models.FloatField(null=True, blank=True)
    actual_energy_impact = models.FloatField(null=True, blank=True)
    actual_passengers_affected = models.IntegerField(null=True, blank=True)
    actual_throughput_impact = models.FloatField(null=True, blank=True)
    
    # System performance
    system_load_at_decision = models.FloatField(null=True, blank=True, help_text="System load percentage")
    network_delays_during_decision = models.JSONField(default=list, help_text="Network delays during decision period")
    
    # Feedback
    controller_satisfaction_score = models.IntegerField(null=True, blank=True, help_text="1-5 satisfaction score")
    controller_feedback = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'decision_analytics'
    
    def __str__(self):
        return f"Analytics for {self.decision.title}"


class ConflictDetection(models.Model):
    """
    Automatic conflict detection between trains/resources
    """
    CONFLICT_TYPES = [
        ('train_precedence', 'Train Precedence Conflict'),
        ('platform_clash', 'Platform Assignment Clash'),
        ('track_capacity', 'Track Capacity Exceeded'),
        ('timing_conflict', 'Schedule Timing Conflict'),
        ('resource_shortage', 'Resource Shortage'),
    ]
    
    conflict_type = models.CharField(max_length=30, choices=CONFLICT_TYPES)
    severity = models.CharField(max_length=20, choices=DecisionPriority.choices)
    
    # Entities involved
    trains_involved = models.JSONField(default=list)
    tracks_involved = models.JSONField(default=list)
    stations_involved = models.JSONField(default=list)
    
    # Timing
    detected_at = models.DateTimeField(auto_now_add=True)
    conflict_time = models.DateTimeField(help_text="When the conflict will occur")
    resolution_deadline = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_decision = models.ForeignKey(Decision, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Details
    conflict_details = models.JSONField(default=dict)
    potential_impact = models.TextField(help_text="Description of potential impact if not resolved")
    
    class Meta:
        db_table = 'conflict_detections'
        ordering = ['-severity', 'conflict_time']
    
    def __str__(self):
        return f"{self.get_conflict_type_display()} - {self.get_severity_display()}"
    
    def create_decision(self):
        """Create a decision from this conflict"""
        if self.resolution_decision:
            return self.resolution_decision
            
        decision = Decision.objects.create(
            title=f"{self.get_conflict_type_display()} Resolution",
            description=f"Resolve {self.conflict_type} involving trains: {', '.join(map(str, self.trains_involved))}",
            decision_type=DecisionType.CONFLICT_RESOLUTION,
            priority=self.severity,
            trains_involved=self.trains_involved,
            tracks_involved=self.tracks_involved,
            stations_involved=self.stations_involved,
            deadline=self.resolution_deadline,
            context_data={
                'conflict_id': self.id,
                'conflict_details': self.conflict_details,
                'potential_impact': self.potential_impact
            }
        )
        
        self.resolution_decision = decision
        self.save()
        return decision