from django.contrib import admin
from .models import Station, MaterialType, RouteComplexity, Freight


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'is_active', 'created_at')
    list_filter = ('state', 'is_active', 'created_at')
    search_fields = ('name', 'city', 'state')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)


@admin.register(MaterialType)
class MaterialTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit', 'is_hazardous', 'created_at')
    list_filter = ('is_hazardous', 'unit', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)


@admin.register(RouteComplexity)
class RouteComplexityAdmin(admin.ModelAdmin):
    list_display = ('origin', 'destination', 'complexity_score', 'distance_km', 'estimated_hours')
    list_filter = ('complexity_score', 'created_at')
    search_fields = ('origin__name', 'destination__name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('complexity_score',)


@admin.register(Freight)
class FreightAdmin(admin.ModelAdmin):
    list_display = (
        'freight_id', 'origin', 'destination', 'material_type', 'quantity', 
        'status', 'scheduled_departure', 'predicted_delay', 'created_at'
    )
    list_filter = (
        'status', 'predicted_delay', 'material_type', 'created_at', 
        'scheduled_departure', 'origin', 'destination'
    )
    search_fields = ('freight_id', 'origin__name', 'destination__name')
    readonly_fields = (
        'freight_id', 'predicted_delay', 'delay_probability', 
        'route_complexity', 'tracking_clicks', 'created_at', 'updated_at'
    )
    date_hierarchy = 'scheduled_departure'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('freight_id', 'origin', 'destination', 'material_type', 'quantity', 'status')
        }),
        ('Schedule', {
            'fields': ('scheduled_departure', 'scheduled_arrival', 'actual_departure', 'actual_arrival')
        }),
        ('ML Predictions', {
            'fields': ('predicted_delay', 'delay_probability', 'route_complexity'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': ('tracking_clicks',),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
