# train_model.py
import os
import pickle
import pandas as pd
import time
import random
from datetime import datetime, timedelta
from threading import Thread
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, LogisticRegression
import warnings
from sklearn.exceptions import InconsistentVersionWarning

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)


# PATHS 
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "freight_data.csv")
TRAIN_MODEL_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "train_model.pkl")

# DYNAMIC DATASET SETTINGS 
TRACK_STATUS_OPTIONS = ["free", "occupied", "maintenance"]
WEATHER_OPTIONS = ["clear", "rain", "storm", "fog"]
FREIGHT_TYPES = ["coal", "food", "electronics", "oil", "automobile"]
STATIONS = ["Delhi", "Kanpur", "Prayagraj", "Itarsi", "Mughalsarai"]
NUM_ROWS = 100
UPDATE_INTERVAL = 10  # seconds

# DATASET GENERATOR 
def generate_freight_data():
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    
    # ===== Initial Data Generation =====
    records = []
    for i in range(1, NUM_ROWS + 1):
        freight_id = f"F{i:04d}"  
        from_station, to_station = random.sample(STATIONS, 2)

        # Random timing
        arrival_time = datetime.now() + timedelta(minutes=random.randint(0, 120))
        departure_time = arrival_time + timedelta(minutes=random.randint(5, 30))

        # Realistic correlated features
        weather = random.choice(WEATHER_OPTIONS)
        track = random.choice(TRACK_STATUS_OPTIONS)
        freight_type = random.choice(FREIGHT_TYPES)
        priority = random.randint(1, 5)
        coach_length = random.randint(20, 200)
        max_speed = random.randint(40, 120)

        # === Create correlation between features and delay ===
        base_delay = {
            "clear": 0,
            "rain": 20,
            "fog": 30,
            "storm": 60
        }[weather]

        track_delay = {
            "free": 0,
            "occupied": 10,
            "maintenance": 40
        }[track]

        # Lower priority = higher delay
        priority_adj = max(0, 6 - priority) * 5

        # Combine with small random noise
        delay_minutes = base_delay + track_delay + priority_adj + random.randint(-5, 5)
        delay_minutes = max(0, delay_minutes)  # no negative delay

        # Binary delay flag
        delayed_flag = 1 if delay_minutes > 15 else 0

        # Record creation
        records.append({
            "freight_id": freight_id,
            "from_station": from_station,
            "to_station": to_station,
            "actual_arrival_time": arrival_time.strftime("%Y-%m-%d %H:%M:%S"),
            "actual_departure_time": departure_time.strftime("%Y-%m-%d %H:%M:%S"),
            "delay_minutes": delay_minutes,
            "track_status": track,
            "weather_impact": weather,
            "freight_type": freight_type,
            "priority_level": priority,
            "coach_length": coach_length,
            "max_speed_kmph": max_speed,
            "delayed_flag": delayed_flag
        })
    
    df = pd.DataFrame(records)
    df.to_csv(DATA_PATH, index=False)
    print(f"[INFO] Initial freight dataset created with {NUM_ROWS} rows (realistic delays).")

    # ===== Dynamic Updates (keep as-is) =====
    while True:
        df["track_status"] = [random.choice(TRACK_STATUS_OPTIONS) for _ in range(NUM_ROWS)]
        df["weather_impact"] = [random.choice(WEATHER_OPTIONS) for _ in range(NUM_ROWS)]
        df["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Occasionally reroute a few freights
        if random.random() < 0.1:
            for idx in range(NUM_ROWS):
                if random.random() < 0.05:
                    df.at[idx, "to_station"] = random.choice([s for s in STATIONS if s != df.at[idx, "from_station"]])

        df.to_csv(DATA_PATH, index=False)
        print(f"[INFO] Dataset updated at {datetime.now().strftime('%H:%M:%S')}")
        time.sleep(UPDATE_INTERVAL)


# TRAIN AND SAVE MODEL 
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score

def train_and_save_model():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError("Freight dataset not found!")

    df = pd.read_csv(DATA_PATH)

    X = df.drop(columns=["delay_minutes", "delayed_flag", "freight_id", "actual_arrival_time", "actual_departure_time"])
    y_reg = df["delay_minutes"]
    y_clf = df["delayed_flag"]

    categorical_cols = ["from_station", "to_station", "track_status", "weather_impact", "freight_type"]
    numeric_cols = ["priority_level", "coach_length", "max_speed_kmph"]

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", StandardScaler(), numeric_cols)
    ])

    regressor = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", LinearRegression())
    ])

    classifier = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(max_iter=1000))
    ])

    # Train both models 
    regressor.fit(X, y_reg)
    classifier.fit(X, y_clf)

    # Evaluate Regression
    y_pred_reg = regressor.predict(X)
    r2 = r2_score(y_reg, y_pred_reg)
    rmse = mean_squared_error(y_reg, y_pred_reg, squared=False)

    # ===== Evaluate Classification =====
    y_pred_clf = classifier.predict(X)
    acc = accuracy_score(y_clf, y_pred_clf)
    prec = precision_score(y_clf, y_pred_clf, zero_division=0)
    rec = recall_score(y_clf, y_pred_clf, zero_division=0)
    f1 = f1_score(y_clf, y_pred_clf, zero_division=0)

    # ===== Print Metrics =====
    print("\n[MODEL PERFORMANCE METRICS]")
  
    print(f"Regression (Delay Minutes): R² = {r2:.4f}, RMSE = {rmse:.2f} mins")
    print(f"Classification (Delayed Flag):")
    print(f"  Accuracy = {acc*100:.2f}% | Precision = {prec:.2f} | Recall = {rec:.2f} | F1 = {f1:.2f}")
    

    # ===== Save Models =====
    os.makedirs(os.path.dirname(TRAIN_MODEL_PATH), exist_ok=True)
    with open(TRAIN_MODEL_PATH, "wb") as f:
        pickle.dump({"regressor": regressor, "classifier": classifier}, f)

    print(f"[INFO] Model trained and saved at {TRAIN_MODEL_PATH}")

# ===================== PREDICTION =====================
def predict_freight_delay(freight_id: str):
    if not os.path.exists(TRAIN_MODEL_PATH):
        raise FileNotFoundError("Trained model not found!")

    df = pd.read_csv(DATA_PATH)
    if freight_id not in df["freight_id"].values:
        return {"error": f"Freight ID {freight_id} not found!"}

    freight = df[df["freight_id"] == freight_id]
    X = freight.drop(columns=["delay_minutes", "delayed_flag", "freight_id", "actual_arrival_time", "actual_departure_time"])

    # ===== Only load your own model =====
    try:
        with open(TRAIN_MODEL_PATH, "rb") as f:
            models = pickle.load(f)
    except InconsistentVersionWarning:
        
        train_and_save_model()
        with open(TRAIN_MODEL_PATH, "rb") as f:
            models = pickle.load(f)

    regressor = models["regressor"]
    classifier = models["classifier"]

    delay_pred = regressor.predict(X)[0]
    flag_pred = classifier.predict(X)[0]

    delay_pred = max(0, delay_pred) if flag_pred == 1 else 0

    return {
        "freight_id": freight_id,
        "from_station": freight["from_station"].values[0],
        "to_station": freight["to_station"].values[0],
        "predicted_delay_minutes": round(float(delay_pred), 2),
        "predicted_delayed_flag": int(flag_pred),
    }


# ===================== LIVE STATUS =====================
def live_status(freight_id: str, interval=10):
    print(f"[INFO] Starting live updates for {freight_id}...\n")
    try:
        while True:
            result = predict_freight_delay(freight_id)
            if "error" in result:
                print(result["error"])
            else:
                status = "ON TIME" if result["predicted_delayed_flag"] == 0 else f"Delayed by {result['predicted_delay_minutes']} mins"
                print(f"[LIVE] {datetime.now().strftime('%H:%M:%S')} → Freight {freight_id} ({result['from_station']} → {result['to_station']}) is {status}")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n[INFO] Stopped live updates.")

# ===================== MAIN =====================
if __name__ == "__main__":
    # Start dataset generator in background
    generator_thread = Thread(target=generate_freight_data, daemon=True)
    generator_thread.start()

    # Give a few seconds for initial dataset
    time.sleep(3)

    # Train model once
    train_and_save_model()

    # Ask user for Freight ID
    freight_id = input("Enter the Freight ID to track (e.g., F0005): ").strip().upper()
    live_status(freight_id, interval=10)
