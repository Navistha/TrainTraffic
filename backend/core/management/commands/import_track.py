import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from  core.models import Track, Station

class Command(BaseCommand):
    help = 'Imports track data from tracks.csv'

    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'tracks.csv')

        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return
            
        self.stdout.write(f"Importing tracks from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    # Look up the station objects using the ID from the CSV
                    source_station = Station.objects.get(id=row['source_station_id'])
                    dest_station = Station.objects.get(id=row['destination_station_id'])

                    # Convert string 'True'/'False' to a Python Boolean
                    is_electrified = row.get('electrification', 'False').strip().lower() == 'true'

                    Track.objects.update_or_create(
                        track_id=row['track_id'],
                        defaults={
                            'source_station': source_station,
                            'destination_station': dest_station,
                            'distance_km': float(row['distance_km']),
                            'track_type': row.get('track_type'),
                            'electrification': is_electrified,
                            'speed_limit': int(row['speed_limit']),
                            'status': row.get('status') or 'active',
                        }
                    )
                except Station.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Skipping track {row['track_id']}: Source or Destination Station not found in the database."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing track {row['track_id']}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported all tracks.'))