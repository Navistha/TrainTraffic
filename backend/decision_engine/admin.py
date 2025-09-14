from django.contrib import admin
from .models import Decision, AIRecommendation, DecisionAction, DecisionAnalytics, ConflictDetection


@admin.register(Decision)
class DecisionAdmin(admin.ModelAdmin):
    list_display = ('title', 'decision_type', 'priority', 'status', 'created_at', 'deadline', 'assigned_controller')
    list_filter = ('decision_type', 'priority', 'status', 'created_at')
    search_fields = ('title', 'description', 'trains_involved', 'stations_involved')
    readonly_fields = ('created_at', 'updated_at', 'decided_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'decision_type', 'priority', 'status')
        }),
        ('Entities Involved', {
            'fields': ('trains_involved', 'tracks_involved', 'stations_involved')
        }),
        ('Timing', {
            'fields': ('deadline', 'time_remaining', 'created_at', 'updated_at')
        }),
        ('Assignment', {
            'fields': ('assigned_controller', 'decided_by', 'decided_at')
        }),
        ('Context', {
            'fields': ('context_data',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('assigned_controller', 'decided_by')


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ('decision', 'recommendation_text_short', 'confidence_score', 'model_version', 'generated_at')
    list_filter = ('model_version', 'generated_at')
    search_fields = ('decision__title', 'recommendation_text')
    readonly_fields = ('generated_at',)
    
    fieldsets = (
        ('Recommendation', {
            'fields': ('decision', 'recommendation_text', 'confidence_score')
        }),
        ('Reasoning', {
            'fields': ('reasoning_points',)
        }),
        ('Expected Impact', {
            'fields': ('delay_reduction_min', 'energy_saving_percent', 'passengers_affected', 'throughput_improvement_percent')
        }),
        ('Model Info', {
            'fields': ('model_version', 'generated_at')
        }),
        ('Alternatives', {
            'fields': ('alternative_options',),
            'classes': ('collapse',)
        })
    )
    
    def recommendation_text_short(self, obj):
        return obj.recommendation_text[:50] + "..." if len(obj.recommendation_text) > 50 else obj.recommendation_text
    recommendation_text_short.short_description = 'Recommendation'


@admin.register(DecisionAction)
class DecisionActionAdmin(admin.ModelAdmin):
    list_display = ('decision', 'action_type', 'action_by', 'action_at')
    list_filter = ('action_type', 'action_at')
    search_fields = ('decision__title', 'action_by__name')
    readonly_fields = ('action_at',)
    
    fieldsets = (
        ('Action', {
            'fields': ('decision', 'action_type', 'action_by', 'action_at')
        }),
        ('Details', {
            'fields': ('modified_recommendation', 'override_reason', 'custom_parameters')
        }),
        ('Actual Impact', {
            'fields': ('actual_delay_impact', 'actual_energy_impact'),
            'classes': ('collapse',)
        })
    )


@admin.register(DecisionAnalytics)
class DecisionAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('decision', 'recommendation_accuracy', 'decision_time_seconds', 'controller_satisfaction_score', 'created_at')
    list_filter = ('controller_satisfaction_score', 'created_at')
    search_fields = ('decision__title',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Decision', {
            'fields': ('decision',)
        }),
        ('Performance Metrics', {
            'fields': ('decision_time_seconds', 'recommendation_accuracy')
        }),
        ('Outcome Metrics', {
            'fields': ('actual_delay_impact', 'actual_energy_impact', 'actual_passengers_affected', 'actual_throughput_impact')
        }),
        ('System Performance', {
            'fields': ('system_load_at_decision', 'network_delays_during_decision'),
            'classes': ('collapse',)
        }),
        ('Feedback', {
            'fields': ('controller_satisfaction_score', 'controller_feedback')
        })
    )


@admin.register(ConflictDetection)
class ConflictDetectionAdmin(admin.ModelAdmin):
    list_display = ('conflict_type', 'severity', 'conflict_time', 'is_resolved', 'detected_at')
    list_filter = ('conflict_type', 'severity', 'is_resolved', 'detected_at')
    search_fields = ('trains_involved', 'stations_involved', 'potential_impact')
    readonly_fields = ('detected_at', 'resolved_at')
    
    fieldsets = (
        ('Conflict Information', {
            'fields': ('conflict_type', 'severity', 'conflict_time', 'resolution_deadline')
        }),
        ('Entities Involved', {
            'fields': ('trains_involved', 'tracks_involved', 'stations_involved')
        }),
        ('Status', {
            'fields': ('is_resolved', 'resolved_at', 'resolution_decision', 'detected_at')
        }),
        ('Details', {
            'fields': ('conflict_details', 'potential_impact'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_resolved', 'create_decisions_for_conflicts']
    
    def mark_resolved(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_resolved=True, resolved_at=timezone.now())
        self.message_user(request, f'{updated} conflicts marked as resolved.')
    mark_resolved.short_description = 'Mark selected conflicts as resolved'
    
    def create_decisions_for_conflicts(self, request, queryset):
        created_count = 0
        for conflict in queryset.filter(resolution_decision__isnull=True):
            decision = conflict.create_decision()
            created_count += 1
        
        self.message_user(request, f'Created {created_count} decisions from conflicts.')
    create_decisions_for_conflicts.short_description = 'Create decisions for selected conflicts'