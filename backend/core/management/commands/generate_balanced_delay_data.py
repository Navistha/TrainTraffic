import csv
import random
from django.core.management.base import BaseCommand
import os
from django.conf import settings
from datetime import datetime, timedelta

# Define the options available in your dataset
TRACK_STATUS_OPTIONS = ["free", "occupied", "maintenance"]
WEATHER_OPTIONS = ["clear", "rain", "fog", "storm"]
TRAIN_TYPES = ["Express", "Superfast", "Passenger"] 

class Command(BaseCommand):
    help = 'Generates a balanced, contextually-simulated dataset for train delay prediction.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--num-records',
            type=int,
            default=2000,
            help='Number of balanced records to generate (default: 2000)',
        )
        parser.add_argument(
            '--output-file',
            type=str,
            default="train_delay_data.csv",
            help='Output filename in the datasets directory (default: train_delay_data_balanced.csv)',
        )

    def handle(self, *args, **options):
        num_records = options['num_records']
        output_filename = options['output_file']
        
        # Define the output path in the main 'datasets' folder
        output_path = os.path.join(settings.BASE_DIR.parent, "backend", "datasets", output_filename)
        
        self.stdout.write(self.style.SUCCESS(f'Generating {num_records} balanced records...'))

        records = []
        base_time = datetime.now()

        for i in range(num_records):
            # 1. Decide if the train will be delayed (approx 50/50 chance)
            # We'll make slightly more 'on-time' examples as they are often more common
            is_delayed = 1 if random.random() < 0.45 else 0  # 45% chance of delay

            delay_mins = 0
            track_stat = "free"
            weather_cond = "clear"

            if is_delayed == 1:
                # --- CONTEXT FOR A "DELAYED" (1) TRAIN ---
                delay_mins = random.randint(5, 120)
                
                # Higher chance of bad conditions if delayed
                if random.random() < 0.6: # 60% chance
                    track_stat = random.choice(["occupied", "maintenance"])
                if random.random() < 0.6: # 60% chance
                    weather_cond = random.choice(["rain", "storm", "fog"])
            else:
                # --- CONTEXT FOR AN "ON-TIME" (0) TRAIN ---
                delay_mins = 0
                
                # Higher chance of good conditions if on-time
                if random.random() < 0.8: # 80% chance
                    track_stat = "free"
                if random.random() < 0.8: # 80% chance
                    weather_cond = "clear"

            # Generate random departure/arrival times
            departure_time = base_time + timedelta(minutes=i*10 + random.randint(0, 5))
            arrival_time = departure_time + timedelta(minutes=random.randint(60, 300) + delay_mins)

            records.append({
                "train_id": f"TRN{i+1:04d}", # Using 'train_id' to be generic
                "from_station": f"STN{random.randint(100, 199)}",
                "to_station": f"STN{random.randint(200, 299)}",
                "actual_arrival_time": arrival_time.strftime("%Y-%m-%d %H:%M:%S"),
                "actual_departure_time": departure_time.strftime("%Y-%m-%d %H:%M:%S"),
                "delay_minutes": delay_mins,
                "track_status": track_stat,
                "weather_impact": weather_cond,
                "train_type": random.choice(TRAIN_TYPES), # Using generic train types
                "priority_level": random.randint(1, 3), # Simplified priority
                "coach_length": random.randint(10, 24),
                "max_speed_kmph": random.randint(80, 160),
                "delayed_flag": is_delayed
            })

        # Write to CSV
        try:
            with open(output_path, 'w', newline='') as f:
                # Renaming columns to match the existing 'train_delay_data.csv' headers
                fieldnames = [
                    "train_id", "from_station", "to_station", 
                    "actual_arrival_time", "actual_departure_time", "delay_minutes", 
                    "track_status", "weather_impact", "train_type", 
                    "priority_level", "coach_length", "max_speed_kmph", "delayed_flag"
                ]
                # Note: We rename our 'train_id' and 'train_type' on-the-fly to match the old headers
                # to avoid changing the ML script's feature names.
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for record in records:
                    # Map new keys to old fieldnames
                    mapped_record = {
                        "train_id": record["train_id"],
                        "from_station": record["from_station"],
                        "to_station": record["to_station"],
                        "actual_arrival_time": record["actual_arrival_time"],
                        "actual_departure_time": record["actual_departure_time"],
                        "delay_minutes": record["delay_minutes"],
                        "track_status": record["track_status"],
                        "weather_impact": record["weather_impact"],
                        "train_type": record["train_type"], # Mapping
                        "priority_level": record["priority_level"],
                        "coach_length": record["coach_length"],
                        "max_speed_kmph": record["max_speed_kmph"],
                        "delayed_flag": record["delayed_flag"]
                    }
                    writer.writerow(mapped_record)
            
            self.stdout.write(self.style.SUCCESS(f'Successfully generated {output_filename} with {len(records)} records.'))
        
        except IOError as e:
            self.stdout.write(self.style.ERROR(f'Error writing to file {output_path}: {e}'))