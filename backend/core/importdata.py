import csv
from django.core.management.base import BaseCommand

from core.models import Station, Train, Track, RailwayWorker, RealTimeDelay


class Command(BaseCommand):
    help = "Import dataset CSVs into existing tables"

    def handle(self, *args, **kwargs):
        # -------------------------
        # Import Stations
        # -------------------------
        import os
        csv_path = os.path.join('datasets', 'stations.csv')
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                Station.objects.update_or_create(
                    station_code=row['station_code'],
                    defaults={
                        'station_name': row.get('station_name'),
                        'state': row.get('state'),
                        'platforms': int(row.get('platforms', 1)),
                        'latitude': float(row['latitude']) if row.get('latitude') else None,
                        'longitude': float(row['longitude']) if row.get('longitude') else None,
                    }
                )
        self.stdout.write(self.style.SUCCESS("Stations imported successfully!"))

        # -------------------------
        # Import Trains
        # -------------------------
        csv_path = os.path.join('datasets', 'trains.csv')
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                Train.objects.update_or_create(
                    train_number=row['train_number'],
                    defaults={
                        'train_name': row.get('train_name'),
                        'train_type': row.get('train_type'),
                        'source_station_id': row.get('source_station'),
                        'destination_station_id': row.get('destination_station'),
                        'total_coaches': int(row.get('total_coaches', 12)),
                        'route_stations': row.get('route_stations'),
                        'distance_km': float(row.get('distance_km', 0)),
                        'duration_min': int(row.get('duration_min', 0)),
                        'speed': int(row.get('speed', 0)) if row.get('speed') else None,
                    }
                )
        self.stdout.write(self.style.SUCCESS("Trains imported successfully!"))

        # -------------------------
        # Import Tracks
        # -------------------------
        csv_path = os.path.join('datasets', 'tracks.csv')
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                Track.objects.update_or_create(
                    source_station_id=row['source_station'],
                    destination_station_id=row['destination_station'],
                    defaults={
                        'distance_km': float(row.get('distance_km', 0)),
                        'track_type': row.get('track_type', 'unknown'),
                        'electrification': row.get('electrification', 'False').lower() in ('true', '1'),
                        'speed_limit': int(row.get('speed_limit', 90)),
                        'status': row.get('status', 'active'),
                    }
                )
        self.stdout.write(self.style.SUCCESS("Tracks imported successfully!"))

        # -------------------------
        # Import Railway Workers
        # -------------------------
        import os
        csv_path = os.path.join('datasets', 'railway_workers.csv')
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Map CSV fields to existing model fields
                govt_id = (row.get('Govt_ID') or '').strip() or None
                name = (row.get('Name') or '').strip() or None
                role = (row.get('Role') or '').strip() or None
                assigned_station = (row.get('Assigned_Station') or '').strip() or None

                if govt_id:
                    RailwayWorker.objects.update_or_create(
                        govt_id=govt_id,
                        defaults={
                            'name': name,
                            'designation': role,
                            'department': 'Traffic',
                            'assigned_station': assigned_station or None,
                        }
                    )
                else:
                    # Fallback if govt_id is missing: create a new record
                    RailwayWorker.objects.create(
                        name=name,
                        designation=role,
                        department='Traffic',
                        assigned_station=assigned_station or None,
                    )
        self.stdout.write(self.style.SUCCESS("Railway workers imported successfully!"))

        # -------------------------
        # Import Real-Time Delays
        # -------------------------
        csv_path = os.path.join('datasets', 'train_delay_data.csv')
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                RealTimeDelay.objects.update_or_create(
                    train_id=row['train_number'],
                    station_id=row['station_code'],
                    scheduled_arrival=row['scheduled_arrival'],
                    defaults={
                        'actual_arrival': row['actual_arrival'] if row.get('actual_arrival') else None,
                        'delay_minutes': int(row.get('delay_minutes', 0)),
                        'predicted_delay': float(row.get('predicted_delay', 0)),
                    }
                )
        self.stdout.write(self.style.SUCCESS("Real-time delays imported successfully!"))
