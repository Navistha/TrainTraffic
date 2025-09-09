from django.contrib import admin
from .models import Station, Train, Track, RailwayWorker, RealTimeDelay


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('id', 'station_code', 'station_name', 'state', 'platforms')


@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('id', 'train_number', 'train_name', 'source_station', 'destination_station', 'total_coaches')


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('track_id', 'source_station_id', 'destination_station_id', 'distance_km', 'track_type', 'electrification', 'speed_limit', 'status')
    list_filter = ('track_type', 'electrification', 'status')
    search_fields = ('source_station_id', 'destination_station_id')



@admin.register(RailwayWorker)
class RailwayWorkerAdmin(admin.ModelAdmin):
    list_display = ('worker_id', 'name', 'designation', 'department', 'assigned_station')


@admin.register(RealTimeDelay)
class RealTimeDelayAdmin(admin.ModelAdmin):
    list_display = ('id', 'train_number', 'station_code', 'scheduled_arrival', 'actual_arrival', 'delay_minutes')
