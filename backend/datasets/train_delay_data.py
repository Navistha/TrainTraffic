import pandas as pd
import random
import time

track_status_options = ["Clear", "Under Maintenance", "Delayed"]
weather_options = ["None", "Rain", "Storm", "Fog"]


df = pd.read_csv(r"backend\datasets\train_delay_data.csv")

while True:
    
    df["track_status"] = [random.choice(track_status_options) for _ in range(len(df))]
    df["weather_impact"] = [random.choice(weather_options) for _ in range(len(df))]
    
    
    df.to_csv(r"backend\datasets\train_delay_data.csv", index=False)
    
    print("✅ Updated track_status & weather_impact dynamically")
    
    
    time.sleep(10)