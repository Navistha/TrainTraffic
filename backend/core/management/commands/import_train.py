import csv
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from core.models import Train

class Command(BaseCommand):
    help = 'Imports train data from trains.csv into the Train model'

    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(settings.BASE_DIR, 'datasets', 'trains.csv')

        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return

        self.stdout.write(f"Importing trains from {csv_file_path}...")

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    Train.objects.update_or_create(
                        train_id=row['train_id'],
                        defaults={
                            'train_number': row['train_number'],
                            'train_name': row['train_name'],
                            'train_type': row.get('train_type'),
                            'priority_level': row.get('priority_level'),
                            'scheduled_route': row.get('scheduled_route'),
                            'coach_length': int(row['coach_length']) if row.get('coach_length') else 12,
                            'max_speed_kmph': int(row['max_speed_kmph']) if row.get('max_speed_kmph') else None,
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing train {row['train_id']}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported all trains.'))