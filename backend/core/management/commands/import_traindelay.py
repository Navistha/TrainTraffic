import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import RealTimeDelay, Train, Station # CORRECTED: Changed model to TrainDelayEvent
from datetime import datetime

class Command(BaseCommand):
    help = 'Imports train delay events from train_delay_data.csv'

    def handle(self, *args, **kwargs):
        # Build a robust file path
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'train_delay_data.csv')
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return

        self.stdout.write(f"Importing train delays from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                try:
                    # Find the related Train and Station objects
                    train = Train.objects.get(train_id=row['train_id'])
                    station = Station.objects.get(id=row['current_station_id'])

                    # Helper function for parsing dates
                    def parse_datetime(dt_string):
                        if not dt_string or dt_string == 'nan': # Handle empty or 'nan' strings
                            return None
                        # IMPORTANT: Adjust '%Y-%m-%d %H:%M:%S' if your CSV date format is different
                        return datetime.strptime(dt_string, '%Y-%m-%d %H:%M:%S')

                    is_delayed = row.get('delayed_flag', 'false').strip().lower() in ['true', '1']

                    # A unique delay event is best identified by the train, station, and arrival time
                    arrival_time = parse_datetime(row.get('actual_arrival_time'))
                    if not arrival_time:
                        self.stdout.write(self.style.WARNING(f"Skipping row for train {row['train_id']} due to missing arrival time."))
                        continue

                    RealTimeDelay.objects.update_or_create(
                        train=train,
                        current_station=station,
                        actual_arrival_time=arrival_time,
                        defaults={
                            'actual_departure_time': parse_datetime(row.get('actual_departure_time')),
                            # CORRECTED: Convert to float first, then to int to handle "16.0"
                            'delay_minutes': int(float(row.get('delay_minutes', 0.0))),
                            'track_status': row.get('track_status'),
                            'weather_impact': row.get('weather_impact'),
                            'train_type': row.get('train_type'),
                            'priority_level': row.get('priority_level'),
                            'coach_length': int(float(row['coach_length'])) if row.get('coach_length') else None,
                            'max_speed_kmph': int(float(row['max_speed_kmph'])) if row.get('max_speed_kmph') else None,
                            'delayed_flag': is_delayed,
                        }
                    )
                except (Train.DoesNotExist, Station.DoesNotExist) as e:
                    self.stdout.write(self.style.WARNING(f"Skipping delay event: Train or Station not found. Details: {e}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error importing delay event for train {row['train_id']}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported all train delay events.'))