import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import Station # Make sure your app name is correct

class Command(BaseCommand):
    help = 'Imports station data from stations.csv into the Station model'

    def handle(self, *args, **kwargs):
        # Construct the full path to the CSV file
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'stations.csv')

        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return

        self.stdout.write(f"Starting to import stations from {csv_file_path}...")

        # Keep track of created/updated records
        stations_created_count = 0
        stations_updated_count = 0

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    # Use update_or_create to prevent duplicates.
                    # It finds a station with the given 'id' and either updates it
                    # with the 'defaults' or creates a new one if it doesn't exist.
                    station, created = Station.objects.update_or_create(
                        id=row['id'],
                        defaults={
                            'station_code': row['station_code'],
                            'station_name': row['station_name'],
                            'division': row.get('division'), # Use .get() for columns that might not exist in all rows
                            'state': row.get('state'),
                            'latitude': float(row['latitude']) if row.get('latitude') else None,
                            'longitude': float(row['longitude']) if row.get('longitude') else None,
                            'platforms': int(row['platforms']) if row.get('platforms') else 1,
                        }
                    )

                    if created:
                        stations_created_count += 1
                    else:
                        stations_updated_count += 1

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing row {reader.line_num}: {row}"))
                    self.stdout.write(self.style.ERROR(f"Exception: {e}"))

        self.stdout.write(self.style.SUCCESS(f'\nImport complete.'))
        self.stdout.write(self.style.SUCCESS(f'{stations_created_count} new stations were created.'))
        self.stdout.write(self.style.WARNING(f'{stations_updated_count} existing stations were updated.'))