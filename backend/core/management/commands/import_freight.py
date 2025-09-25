import csv
from django.core.management.base import BaseCommand
from core.models import Freight, Station
from datetime import datetime

class Command(BaseCommand):
    help = 'Imports freight data from freights.csv'

    def handle(self, *args, **kwargs):
        csv_file_path = 'datasets/freight_data.csv'
        self.stdout.write(f"Importing freights from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    # Find the related Station object
                    station = Station.objects.get(id=row['current_station_id'])

                    # Safely parse date/time strings, handling empty values
                    def parse_datetime(dt_string):
                        if not dt_string:
                            return None
                        # IMPORTANT: Adjust the format '%Y-%m-%d %H:%M:%S' if your CSV uses a different date format
                        return datetime.strptime(dt_string, '%Y-%m-%d %H:%M:%S')

                    # Convert string 'true'/'false' to Python Boolean
                    is_delayed = row.get('delayed_flag', 'false').strip().lower() == 'true'

                    Freight.objects.update_or_create(
                        freight_id=row['freight_id'],
                        defaults={
                            'current_station': station,
                            'actual_arrival_time': parse_datetime(row.get('actual_arrival_time')),
                            'actual_departure_time': parse_datetime(row.get('actual_departure_time')),
                            'delay_minutes': int(row.get('delay_minutes', 0)),
                            'track_status': row.get('track_status'),
                            'weather_impact': row.get('weather_impact'),
                            'freight_type': row.get('freight_type'),
                            'priority_level': row.get('priority_level'),
                            'coach_length': int(row['coach_length']) if row.get('coach_length') else None,
                            'max_speed_kmph': int(row['max_speed_kmph']) if row.get('max_speed_kmph') else None,
                            'delayed_flag': is_delayed,
                            'timestamp': parse_datetime(row.get('timestamp')),
                        }
                    )
                except Station.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Skipping freight {row['freight_id']}: Station ID {row['current_station_id']} not found."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error importing freight {row['freight_id']}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported all freights.'))