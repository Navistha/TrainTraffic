from django.contrib import admin
from .models import Station, Train, Track, RailwayWorker, RealTimeDelay, Freight, Schedule

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('station_code', 'station_name', 'division', 'state', 'platforms')
    search_fields = ('station_name', 'station_code')

@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('train_id', 'train_number', 'train_name', 'train_type', 'priority_level', 'coach_length')
    search_fields = ('train_name', 'train_number', 'train_id')

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('track_id', 'source_station', 'destination_station', 'distance_km', 'status')
    list_filter = ('status', 'track_type', 'electrification')

@admin.register(RailwayWorker)
class RailwayWorkerAdmin(admin.ModelAdmin):
    list_display = ('govt_id', 'name', 'role', 'level', 'assigned_station')
    search_fields = ('name', 'govt_id')
    list_filter = ('role', 'level')

@admin.register(RealTimeDelay)
class RealTimeDelayAdmin(admin.ModelAdmin):
    list_display = ('train', 'current_station', 'delay_minutes', 'delayed_flag', 'actual_arrival_time')
    list_filter = ('delayed_flag',)

@admin.register(Freight)
class FreightAdmin(admin.ModelAdmin):
    list_display = ('freight_id', 'current_station', 'freight_type', 'priority_level', 'timestamp')
    search_fields = ('freight_id',)
    list_filter = ('freight_type', 'priority_level')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('train', 'track', 'from_station', 'to_station', 'start_time', 'end_time')
    search_fields = ('train__train_number', 'track__track_id')