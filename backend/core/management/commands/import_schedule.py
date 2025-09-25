import csv
from django.core.management.base import BaseCommand
from core.models import Schedule, Train, Track, Station
from datetime import datetime

class Command(BaseCommand):
    help = 'Imports schedule data from schedule_output.csv'

    def handle(self, *args, **kwargs):
        csv_file_path = 'datasets/schedule_output.csv'
        self.stdout.write(f"Importing schedule from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    train = Train.objects.get(train_id=row['train_id'])
                    track = Track.objects.get(track_id=row['track_id'])
                    from_station = Station.objects.get(id=row['from_station'])
                    to_station = Station.objects.get(id=row['to_station'])

                    def parse_datetime(dt_string):
                        if not dt_string:
                            return None
                        # Adjust format if needed
                        return datetime.strptime(dt_string, '%Y-%m-%d %H:%M:%S')

                    # This assumes a unique combination of train and track defines a schedule entry
                    Schedule.objects.update_or_create(
                        train=train,
                        track=track,
                        from_station=from_station,
                        to_station=to_station,
                        defaults={
                            'priority': row.get('priority'),
                            'start_time': parse_datetime(row.get('start_time')),
                            'end_time': parse_datetime(row.get('end_time')),
                            'duration_min': int(row.get('duration_min', 0)),
                        }
                    )
                except (Train.DoesNotExist, Track.DoesNotExist, Station.DoesNotExist) as e:
                    self.stdout.write(self.style.WARNING(f"Skipping schedule entry: A linked object was not found. Details: {e}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error importing schedule for train {row['train_id']}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported all schedules.'))