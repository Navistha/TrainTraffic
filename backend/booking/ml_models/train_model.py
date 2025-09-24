import os
import time
import pickle
import pandas as pd
import random
from datetime import datetime, timedelta
from multiprocessing import Process
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, LogisticRegression

# ===================== PATHS =====================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "freight_data.csv")
CLASSIFIER_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "delay_preprocessor.pkl")

# ===================== DATA SETTINGS =====================
TRACK_STATUS_OPTIONS = ["free", "occupied", "maintenance"]
WEATHER_OPTIONS = ["clear", "rain", "storm", "fog"]
FREIGHT_TYPES = ["coal", "food", "electronics", "oil", "automobile"]
STATIONS = ["Delhi", "Kanpur", "Prayagraj", "Itarsi", "Mughalsarai"]

NUM_ROWS = 70
UPDATE_INTERVAL = 10


# ===================== DATA GENERATOR =====================
def generate_freight_data():
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)

    records = []
    for i in range(1, NUM_ROWS + 1):
        freight_id = f"FRT{i:03d}"
        arrival_time = datetime.now() + timedelta(minutes=random.randint(0, 120))
        departure_time = arrival_time + timedelta(minutes=random.randint(5, 30))

        record = {
            "freight_id": freight_id,
            "current_station_id": random.choice(STATIONS),
            "actual_arrival_time": arrival_time.strftime("%Y-%m-%d %H:%M:%S"),
            "actual_departure_time": departure_time.strftime("%Y-%m-%d %H:%M:%S"),
            "delay_minutes": random.randint(0, 120),
            "track_status": random.choice(TRACK_STATUS_OPTIONS),
            "weather_impact": random.choice(WEATHER_OPTIONS),
            "freight_type": random.choice(FREIGHT_TYPES),
            "priority_level": random.randint(1, 5),
            "coach_length": random.randint(20, 200),
            "max_speed_kmph": random.randint(40, 120),
            "delayed_flag": random.choice([0, 1]),
        }
        records.append(record)

    df = pd.DataFrame(records)
    df.to_csv(DATA_PATH, index=False)
    print(f"[INFO] Initial freight dataset created with {NUM_ROWS} entries.")

    while True:
        df["track_status"] = [random.choice(TRACK_STATUS_OPTIONS) for _ in range(NUM_ROWS)]
        df["weather_impact"] = [random.choice(WEATHER_OPTIONS) for _ in range(NUM_ROWS)]
        df["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        df.to_csv(DATA_PATH, index=False)
        print(f"[INFO] Dataset updated at {datetime.now().strftime('%H:%M:%S')}")
        time.sleep(UPDATE_INTERVAL)


# ===================== MODEL TRAINING =====================
def train_models():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError("Dataset not found. The data generator should be running.")

    df = pd.read_csv(DATA_PATH)

    X = df.drop(columns=["delay_minutes", "delayed_flag", "freight_id", "actual_arrival_time", "actual_departure_time"])
    y_reg = df["delay_minutes"]
    y_clf = df["delayed_flag"]

    categorical_cols = ["current_station_id", "track_status", "weather_impact", "freight_type"]
    numeric_cols = ["priority_level", "coach_length", "max_speed_kmph"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
            ("num", StandardScaler(), numeric_cols),
        ]
    )

    regressor = Pipeline([("preprocessor", preprocessor), ("regressor", LinearRegression())])
    classifier = Pipeline([("preprocessor", preprocessor), ("classifier", LogisticRegression(max_iter=1000))])

    X_train, _, y_reg_train, _ = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    _, _, y_clf_train, _ = train_test_split(X, y_clf, test_size=0.2, random_state=42)

    regressor.fit(X_train, y_reg_train)
    classifier.fit(X_train, y_clf_train)

    os.makedirs(os.path.dirname(REGRESSOR_PATH), exist_ok=True)
    with open(REGRESSOR_PATH, "wb") as f:
        pickle.dump(regressor, f)
    with open(CLASSIFIER_PATH, "wb") as f:
        pickle.dump(classifier, f)
    with open(PREPROCESSOR_PATH, "wb") as f:
        pickle.dump(preprocessor, f)

    print("[INFO] Models trained and saved.")


# ===================== PREDICTION =====================
def predict_freight_delay(freight_id: str):
    if not os.path.exists(DATA_PATH):
        return {"error": "Dataset not found."}
    
    df = pd.read_csv(DATA_PATH)
    
    if freight_id not in df["freight_id"].values:
        return {"error": f"Freight ID {freight_id} not found."}

    freight = df[df["freight_id"] == freight_id]
    X = freight.drop(columns=["delay_minutes", "delayed_flag", "freight_id", "actual_arrival_time", "actual_departure_time"])

    # Load models
    with open(REGRESSOR_PATH, "rb") as f:
        regressor = pickle.load(f)
    with open(CLASSIFIER_PATH, "rb") as f:
        classifier = pickle.load(f)

    delay_pred = regressor.predict(X)[0]
    flag_pred = classifier.predict(X)[0]

    # Logical fix: zero out delay if flagged as not delayed
    if flag_pred == 0:
        delay_pred = 0

    return {
        "freight_id": freight_id,
        "predicted_delay_minutes": round(float(delay_pred), 2),
        "predicted_delayed_flag": int(flag_pred),
    }



# ===================== LIVE PREDICTIONS =====================
def live_status(freight_id: str, interval=10):
    print(f"[INFO] Starting live updates for {freight_id}...\n")
    try:
        while True:
            result = predict_freight_delay(freight_id)
            print(f"[LIVE] {datetime.now().strftime('%H:%M:%S')} → {result}")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n[INFO] Stopped live updates.")


# ===================== MAIN =====================
if __name__ == "__main__":
    # Start dataset generator in background
    p = Process(target=generate_freight_data)
    p.daemon = True
    p.start()
    print("[INFO] Freight dataset generator started in background.")

    # Wait a few seconds to ensure initial dataset exists
    time.sleep(3)

    # Train models
    train_models()

    # Ask user for Freight ID to track
    freight_id = input("Enter the Freight ID to track (e.g., FRT005): ").strip().upper()
    live_status(freight_id, interval=10)
