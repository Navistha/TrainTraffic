import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Employee, Station

class Command(BaseCommand):
    help = 'Loads or updates employee data from a railway_workers.csv file'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'railway_workers.csv')
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return

        self.stdout.write("Pre-fetching stations for performance...")
        stations_map = {station.id: station for station in Station.objects.all()}
        self.stdout.write(f"Found {len(stations_map)} stations.")

        # --- THIS IS THE KEY CHANGE ---
        # The map now includes keys with underscores to match your CSV data.
        role_map = {
            # Versions with spaces
            "Station Master": "station_master",
            "Section Controller": "section_controller",
            "Freight Operator": "freight_operator",
            "Track Manager": "track_manager",
            # Versions with underscores
            "Station_Master": "station_master",
            "Section_Controller": "section_controller",
            "Freight_Operator": "freight_operator",
            "Track_Manager": "track_manager",
        }

        self.stdout.write(f"Importing workers from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            created_count = 0
            updated_count = 0

            for row in reader:
                govt_id = row.get('Govt_ID')
                if not govt_id:
                    self.stdout.write(self.style.WARNING("Skipping row with missing Govt_ID."))
                    continue
                
                try:
                    assigned_station_id = row.get('Assigned_Station')
                    station = stations_map.get(assigned_station_id)
                    
                    if assigned_station_id and not station:
                        self.stdout.write(self.style.WARNING(f"Skipping worker {govt_id}: Assigned station ID '{assigned_station_id}' not found in database."))
                        continue

                    # We also use .strip() to remove any accidental leading/trailing whitespace
                    csv_role = row.get('Role', '').strip()
                    db_role = role_map.get(csv_role)

                    if not db_role:
                        self.stdout.write(self.style.WARNING(f"Skipping worker {govt_id}: Role '{csv_role}' is not a valid choice."))
                        continue

                    employee, created = Employee.objects.get_or_create(
                        govt_id=govt_id,
                        defaults={
                            'name': row['Name'],
                            'role': db_role,
                            'level': row.get('Level'),
                            'assigned_station': station,
                        }
                    )
                    
                    if created:
                        employee.set_unusable_password()
                        employee.save()
                        created_count += 1
                    else:
                        employee.name = row['Name']
                        employee.role = db_role
                        employee.level = row.get('Level')
                        employee.assigned_station = station
                        employee.save()
                        updated_count += 1

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing worker {govt_id}: {e}"))
            
            summary = f"Import complete. Created: {created_count}, Updated: {updated_count}."
            self.stdout.write(self.style.SUCCESS(summary))