import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
from datetime import datetime
from pathlib import Path

# Base path of project (auto-detect)
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "train_delays.csv"
MODEL_PATH = Path(__file__).resolve().parent / "delay_model.pkl"

# Convert "HH:MM" time string into minutes since midnight
def time_to_minutes(t):
    if isinstance(t, str):
        h, m = map(int, t.split(":"))
        return h * 60 + m
    return t

def train_model():
    # Load dataset
    df = pd.read_csv(DATASET_PATH)

    # Convert times to numeric (minutes since midnight)
    df["scheduled_arrival"] = df["scheduled_arrival"].apply(time_to_minutes)
    df["actual_arrival"] = df["actual_arrival"].apply(time_to_minutes)

    # Features and target
    X = df[["scheduled_arrival", "actual_arrival", "weather", "section"]]
    y = df["delay_minutes"]

    # One-hot encode categorical features
    X = pd.get_dummies(X)

    # Train model
    model = RandomForestRegressor()
    model.fit(X, y)

    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"✅ Model trained and saved at {MODEL_PATH}")


def predict_delay(scheduled_arrival, actual_arrival, weather, section):
    # Load trained model
    model = joblib.load(MODEL_PATH)

    # Convert input times
    scheduled_arrival = time_to_minutes(scheduled_arrival)
    actual_arrival = time_to_minutes(actual_arrival)

    # Build input data
    data = {
        "scheduled_arrival": [scheduled_arrival],
        "actual_arrival": [actual_arrival],
        "weather": [weather],
        "section": [section]
    }

    X_new = pd.DataFrame(data)
    X_new = pd.get_dummies(X_new)

    # Align columns with training model
    model_columns = model.feature_names_in_
    X_new = X_new.reindex(columns=model_columns, fill_value=0)

    # Predict delay
    return model.predict(X_new)[0]


if __name__ == "__main__":
    # Train the model when running directly
    train_model()
    print("Predicted Delay Example:", predict_delay("10:30", "10:45", "rainy", "section_A"))
