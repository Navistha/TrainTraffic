import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "freight_demand_forecast.joblib")

def train_model():
    """Train a fresh model compatible with sklearn 1.4.2"""

    # --- synthetic dataset ---
    n = 500
    data = pd.DataFrame({
        "location": np.random.choice(["Delhi", "Mumbai", "Chennai", "Kolkata"], n),
        "goods_type": np.random.choice(["coal", "steel", "food", "cement"], n),
        "day_of_week": np.random.randint(0, 7, n),
        "horizon": np.random.randint(1, 30, n),
    })

    # very simple demand function
    data["wagons_required"] = (
        np.where(data["location"] == "Delhi", 100, 80)
        + np.where(data["goods_type"] == "coal", 30, 10)
        + data["horizon"] * 2
        + np.random.randint(0, 20, n)
    )

    categorical = ["location", "goods_type"]
    numeric = ["day_of_week", "horizon"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", "passthrough", numeric),
        ]
    )

    model = RandomForestRegressor(n_estimators=50, random_state=42)

    pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("model", model),
    ])

    pipeline.fit(data[categorical + numeric], data["wagons_required"])

    # Save as artifact dict with model and feature columns
    artifact = {
        "model": pipeline,
        "feature_cols": categorical + numeric,
        "categorical_features": categorical,
        "numeric_features": numeric,
    }
    joblib.dump(artifact, MODEL_PATH)
    print("💾 Model retrained and saved:", MODEL_PATH)


def run_prediction(locations, goods_types, horizon):
    """Predict for API call"""

    if not os.path.exists(MODEL_PATH):
        print("⚠ No model found. Training new one...")
        train_model()

    artifact = joblib.load(MODEL_PATH)
    
    # Handle both old (pipeline) and new (artifact dict) formats
    if isinstance(artifact, dict):
        model = artifact["model"]
        feature_cols = artifact["feature_cols"]
    else:
        # Fallback for old format (pipeline only)
        model = artifact
        feature_cols = ["location", "goods_type", "day_of_week", "horizon"]

    df = pd.DataFrame({
        "location": locations,
        "goods_type": goods_types,
        "day_of_week": [2] * len(locations),
        "horizon": [horizon] * len(locations),
    })

    preds = model.predict(df[feature_cols])
    return preds.tolist()

def recursive_forecast(model, feature_cols, history_df, horizon_days=30):
    """
    Simple recursive forecasting:
    - history_df has columns: date, location, goods_type, wagons_required
    - model predicts wagons_required
    - forecast horizon_days days into the future
    """
    import pandas as pd

    # Copy to avoid modifying caller data
    df = history_df.copy().sort_values("date")

    last_date = df["date"].max()
    locations = df["location"].unique()
    goods_types = df["goods_type"].unique()

    future_rows = []

    for day in range(1, horizon_days + 1):
        next_date = last_date + pd.Timedelta(days=day)

        for loc in locations:
            for goods in goods_types:
                row = {
                    "date": next_date,
                    "location": loc,
                    "goods_type": goods,
                    "day_of_week": next_date.dayofweek,  # Add missing feature
                    "horizon": day,  # Add missing feature
                }

                # Create feature row for model
                X = pd.DataFrame([row])[feature_cols]

                # Predict
                pred = float(model.predict(X)[0])
                row["wagons_required"] = max(pred, 0)

                future_rows.append(row)

    return pd.DataFrame(future_rows)

def main():
    # minimal test
    train_model()
    out = run_prediction(["Delhi"], ["Coal"], 10)
    print("Prediction:", out)


if __name__ == "__main__":
    main()
