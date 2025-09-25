import csv
from django.core.management.base import BaseCommand
from core.models import RealTimeDelay, Train, Station
from datetime import datetime

class Command(BaseCommand):
    help = 'Imports train delay events from traindelay.csv'

    def handle(self, *args, **kwargs):
        csv_file_path = 'datasets/train_delay_data.csv'
        self.stdout.write(f"Importing train delays from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                try:
                    # Find the related Train and Station objects
                    train = Train.objects.get(train_id=row['train_id'])
                    station = Station.objects.get(id=row['current_station_id'])

                    # Re-usable helper function for parsing dates
                    def parse_datetime(dt_string):
                        if not dt_string:
                            return None
                        # Adjust format if needed
                        return datetime.strptime(dt_string, '%Y-%m-%d %H:%M:%S')

                    is_delayed = row.get('delayed_flag', 'false').strip().lower() == 'true'

                    # Using update_or_create requires a unique identifier. Here we assume a combo of train and station is unique for an event.
                    # If not, you might need an ID in your CSV or just use .create()
                    RealTimeDelay.objects.update_or_create(
                        train=train,
                        current_station=station,
                        actual_arrival_time=parse_datetime(row.get('actual_arrival_time')),
                        defaults={
                            'actual_departure_time': parse_datetime(row.get('actual_departure_time')),
                            'delay_minutes': int(row.get('delay_minutes', 0)),
                            'track_status': row.get('track_status'),
                            'weather_impact': row.get('weather_impact'),
                            'train_type': row.get('train_type'),
                            'priority_level': row.get('priority_level'),
                            'coach_length': int(row['coach_length']) if row.get('coach_length') else None,
                            'max_speed_kmph': int(row['max_speed_kmph']) if row.get('max_speed_kmph') else None,
                            'delayed_flag': is_delayed,
                        }
                    )
                except (Train.DoesNotExist, Station.DoesNotExist) as e:
                    self.stdout.write(self.style.WARNING(f"Skipping delay event: Train or Station not found. Details: {e}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error importing delay event for train {row['train_id']}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported all train delay events.'))