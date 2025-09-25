import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import RailwayWorker, Station

class Command(BaseCommand):
    help = 'Imports worker data from railway_worker.csv'

    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'railway_workers.csv')
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return

        self.stdout.write(f"Importing workers from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            # Note the CSV uses 'Assigned_Station' as the header
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    station = None
                    assigned_station_code = row.get('Assigned_Station')
                    if assigned_station_code:
                        # Look up the station by its short code
                        station = Station.objects.get(station_code=assigned_station_code)

                    RailwayWorker.objects.update_or_create(
                        govt_id=row['Govt_ID'],
                        defaults={
                            'name': row['Name'],
                            'role': row.get('Role'),
                            'level': row.get('Level'),
                            'assigned_station': station,
                        }
                    )
                except Station.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Skipping worker {row['Govt_ID']}: Assigned station code '{assigned_station_code}' not found."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing worker {row['Govt_ID']}: {e}"))
        
        self.stdout.write(self.style.SUCCESS('Successfully imported all workers.'))