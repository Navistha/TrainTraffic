import pandas as pd
import random
import time
from datetime import datetime, timedelta
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "freight_data.csv")
os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)

# Options
TRACK_STATUS_OPTIONS = ["free", "occupied", "maintenance"]
WEATHER_OPTIONS = ["clear", "rain", "storm", "fog"]
FREIGHT_TYPES = ["coal", "food", "electronics", "oil", "automobile"]
STATIONS = ["Delhi", "Kanpur", "Prayagraj", "Itarsi", "Mughalsarai"]

NUM_ROWS = 100
UPDATE_INTERVAL = 10   # seconds

# ===================== INITIAL DATA CREATION =====================
records = []
for i in range(1, NUM_ROWS + 1):
    freight_id = f"F{i:04d}"  
    
    # Ensure "from" and "to" are not the same
    from_station, to_station = random.sample(STATIONS, 2)

    arrival_time = datetime.now() + timedelta(minutes=random.randint(0, 120))
    departure_time = arrival_time + timedelta(minutes=random.randint(5, 30))
    
    record = {
        "freight_id": freight_id,
        "from_station": from_station,
        "to_station": to_station,
        "actual_arrival_time": arrival_time.strftime("%Y-%m-%d %H:%M:%S"),
        "actual_departure_time": departure_time.strftime("%Y-%m-%d %H:%M:%S"),
        "delay_minutes": random.randint(0, 120),
        "track_status": random.choice(TRACK_STATUS_OPTIONS),
        "weather_impact": random.choice(WEATHER_OPTIONS),
        "freight_type": random.choice(FREIGHT_TYPES),
        "priority_level": random.randint(1, 5),
        "coach_length": random.randint(20, 200),
        "max_speed_kmph": random.randint(40, 120),
        "delayed_flag": random.choice([0, 1])
    }
    records.append(record)

df = pd.DataFrame(records)
df.to_csv(DATA_PATH, index=False)
print(f"[INFO] Initial freight dataset with {NUM_ROWS} rows created.")


# ===================== LIVE UPDATES =====================
while True:
    df["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    df["track_status"] = [random.choice(TRACK_STATUS_OPTIONS) for _ in range(NUM_ROWS)]
    df["weather_impact"] = [random.choice(WEATHER_OPTIONS) for _ in range(NUM_ROWS)]
    
    # (Optional) dynamically shuffle "to_station" sometimes to simulate reroutes
    if random.random() < 0.1:  # 10% chance reroute
        for idx in range(NUM_ROWS):
            if random.random() < 0.05:  # 5% per freight chance
                df.at[idx, "to_station"] = random.choice([s for s in STATIONS if s != df.at[idx, "from_station"]])

    df.to_csv(DATA_PATH, index=False)
    print(f"[INFO] Dataset updated with new weather/track statuses at {datetime.now().strftime('%H:%M:%S')}")
    
    time.sleep(UPDATE_INTERVAL)
