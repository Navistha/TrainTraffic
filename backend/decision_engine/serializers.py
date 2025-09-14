from rest_framework import serializers
from .models import Decision, AIRecommendation, DecisionAction, DecisionAnalytics, ConflictDetection
from core.models import Employee


class AIRecommendationSerializer(serializers.ModelSerializer):
    impact_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = AIRecommendation
        fields = [
            'recommendation_text', 'confidence_score', 'reasoning_points',
            'delay_reduction_min', 'energy_saving_percent', 'passengers_affected',
            'throughput_improvement_percent', 'model_version', 'generated_at',
            'alternative_options', 'impact_summary'
        ]
    
    def get_impact_summary(self, obj):
        return obj.get_impact_summary()


class DecisionActionSerializer(serializers.ModelSerializer):
    action_by_name = serializers.CharField(source='action_by.name', read_only=True)
    
    class Meta:
        model = DecisionAction
        fields = [
            'id', 'action_type', 'action_by', 'action_by_name', 'action_at',
            'modified_recommendation', 'override_reason', 'custom_parameters',
            'actual_delay_impact', 'actual_energy_impact'
        ]


class DecisionListSerializer(serializers.ModelSerializer):
    """Serializer for decision list view (minimal fields)"""
    time_remaining = serializers.SerializerMethodField()
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    decision_type_display = serializers.CharField(source='get_decision_type_display', read_only=True)
    
    class Meta:
        model = Decision
        fields = [
            'id', 'title', 'description', 'decision_type', 'decision_type_display',
            'priority', 'priority_display', 'status', 'status_display',
            'trains_involved', 'stations_involved', 'created_at', 'deadline',
            'time_remaining'
        ]
    
    def get_time_remaining(self, obj):
        return obj.get_time_remaining_minutes()


class DecisionDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed decision view"""
    ai_recommendation = AIRecommendationSerializer(read_only=True)
    actions = DecisionActionSerializer(many=True, read_only=True)
    time_remaining = serializers.SerializerMethodField()
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    decision_type_display = serializers.CharField(source='get_decision_type_display', read_only=True)
    assigned_controller_name = serializers.CharField(source='assigned_controller.name', read_only=True)
    
    class Meta:
        model = Decision
        fields = [
            'id', 'title', 'description', 'decision_type', 'decision_type_display',
            'priority', 'priority_display', 'status', 'status_display',
            'trains_involved', 'tracks_involved', 'stations_involved',
            'created_at', 'updated_at', 'deadline', 'time_remaining',
            'assigned_controller', 'assigned_controller_name', 'decided_by',
            'decided_at', 'context_data', 'ai_recommendation', 'actions'
        ]
    
    def get_time_remaining(self, obj):
        return obj.get_time_remaining_minutes()


class DecisionActionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating decision actions"""
    
    class Meta:
        model = DecisionAction
        fields = [
            'decision', 'action_type', 'modified_recommendation',
            'override_reason', 'custom_parameters'
        ]
    
    def create(self, validated_data):
        # Automatically set action_by to current user
        validated_data['action_by'] = self.context['request'].user
        action = super().create(validated_data)
        
        # Update decision status based on action
        decision = action.decision
        if action.action_type == 'accept':
            decision.status = 'accepted'
        elif action.action_type == 'modify':
            decision.status = 'modified'
        elif action.action_type == 'override':
            decision.status = 'overridden'
        
        decision.decided_by = action.action_by
        decision.decided_at = action.action_at
        decision.save()
        
        return action


class ConflictDetectionSerializer(serializers.ModelSerializer):
    conflict_type_display = serializers.CharField(source='get_conflict_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = ConflictDetection
        fields = [
            'id', 'conflict_type', 'conflict_type_display', 'severity', 'severity_display',
            'trains_involved', 'tracks_involved', 'stations_involved',
            'detected_at', 'conflict_time', 'resolution_deadline',
            'is_resolved', 'resolved_at', 'resolution_decision',
            'conflict_details', 'potential_impact'
        ]


class DecisionAnalyticsSerializer(serializers.ModelSerializer):
    decision_title = serializers.CharField(source='decision.title', read_only=True)
    
    class Meta:
        model = DecisionAnalytics
        fields = [
            'decision', 'decision_title', 'decision_time_seconds', 'recommendation_accuracy',
            'actual_delay_impact', 'actual_energy_impact', 'actual_passengers_affected',
            'actual_throughput_impact', 'system_load_at_decision', 'network_delays_during_decision',
            'controller_satisfaction_score', 'controller_feedback', 'created_at'
        ]


class DecisionSummarySerializer(serializers.Serializer):
    """Serializer for decision center dashboard summary"""
    total_pending = serializers.IntegerField()
    high_priority_pending = serializers.IntegerField()
    medium_priority_pending = serializers.IntegerField()
    low_priority_pending = serializers.IntegerField()
    decisions_today = serializers.IntegerField()
    recommendations_accuracy = serializers.FloatField()
    avg_decision_time_minutes = serializers.FloatField()
    active_conflicts = serializers.IntegerField()


class DecisionEngineStatusSerializer(serializers.Serializer):
    """Serializer for decision engine status"""
    status = serializers.CharField()
    last_cycle_run = serializers.DateTimeField()
    decisions_processed_today = serializers.IntegerField()
    conflicts_detected_today = serializers.IntegerField()
    ai_engine_active = serializers.BooleanField()
    ml_models_loaded = serializers.BooleanField()