import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Station

class Command(BaseCommand):
    help = 'Loads unique station data from stations.csv, handling duplicates and maximizing performance.'

    @transaction.atomic  # Ensures the entire operation is a single transaction
    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'stations.csv')

        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return

        self.stdout.write("Reading and de-duplicating stations from CSV file...")
        
        # Use a dictionary to store unique stations, keyed by 'station_code'
        # This automatically handles duplicates in the source file.
        unique_stations_data = {}
        try:
            with open(csv_file_path, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    station_code = row.get('station_code')
                    if station_code:
                        unique_stations_data[station_code] = row
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred while reading the CSV: {e}"))
            return

        self.stdout.write(f"Found {len(unique_stations_data)} unique stations to import.")

        # Clear existing data for a fresh import
        self.stdout.write("Clearing existing station data from the database...")
        Station.objects.all().delete()

        stations_to_create = []
        for row_data in unique_stations_data.values():
            try:
                stations_to_create.append(
                    Station(
                        id=row_data['id'],
                        station_code=row_data['station_code'],
                        station_name=row_data['station_name'],
                        division=row_data.get('division'),
                        state=row_data.get('state'),
                        latitude=float(row_data['latitude']) if row_data.get('latitude') else None,
                        longitude=float(row_data['longitude']) if row_data.get('longitude') else None,
                        platforms=int(row_data['platforms']) if row_data.get('platforms') else 1,
                    )
                )
            except (ValueError, KeyError) as e:
                self.stdout.write(self.style.WARNING(f"Skipping station {row_data.get('station_code')} due to invalid data: {e}"))

        # Use bulk_create for high performance. This is one single database query.
        if stations_to_create:
            Station.objects.bulk_create(stations_to_create)
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(stations_to_create)} unique stations.'))
        else:
            self.stdout.write(self.style.WARNING('No new stations were imported.'))