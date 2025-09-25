#!/usr/bin/env python3
# Forecast next 30 days per (location, goods_type) using the trained model
# Reads historical data from backend/datasets and writes forecasts to backend/datasets/forecasts

import os
import sys
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "datasets"))
DATA_CSV = os.path.join(DATASETS_DIR, "freight_demand_simulated.csv")
MODEL_PATH = os.path.join(BASE_DIR, "freight_demand_model.joblib")
FORECASTS_DIR = os.path.join(DATASETS_DIR, "forecasts")
os.makedirs(FORECASTS_DIR, exist_ok=True)
OUT_CSV = os.path.join(FORECASTS_DIR, "freight_demand_forecast_next_30_days.csv")

TARGET = "wagons_required"


def make_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().sort_values(["location", "goods_type", "date"]).reset_index(drop=True)
    for lag in (1, 7, 14):
        df[f"lag_{lag}"] = df.groupby(["location", "goods_type"])[TARGET].shift(lag)
    df["roll7_mean"] = (
        df.groupby(["location", "goods_type"])[TARGET]
        .transform(lambda s: s.shift(1).rolling(7, min_periods=1).mean())
    )
    df["dow"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["is_month_start"] = df["date"].dt.is_month_start.astype(int)
    df["is_month_end"] = df["date"].dt.is_month_end.astype(int)
    return df


def recursive_forecast(model, feature_cols, hist_df: pd.DataFrame, horizon_days: int = 30) -> pd.DataFrame:
    hist_df = hist_df.sort_values(["location", "goods_type", "date"]).reset_index(drop=True)
    last_date = hist_df["date"].max()
    groups = hist_df[["location", "goods_type"]].drop_duplicates().values.tolist()

    all_preds = []
    for loc, goods in groups:
        gdf = hist_df[(hist_df.location == loc) & (hist_df.goods_type == goods)].copy().sort_values("date")
        for i in range(1, horizon_days + 1):
            d = last_date + pd.Timedelta(days=i)
            row = {"date": d, "location": loc, "goods_type": goods}
            temp = pd.concat([gdf, pd.DataFrame([row])], ignore_index=True)
            temp = make_features(temp)
            fe = temp.iloc[[-1]].copy()

            for lag in (1, 7, 14):
                col = f"lag_{lag}"
                if pd.isna(fe[col].values[0]):
                    fallback = gdf[TARGET].iloc[-1] if len(gdf) > 0 else temp["roll7_mean"].iloc[-1]
                    fe[col] = fallback
            if pd.isna(fe["roll7_mean"].values[0]):
                fe["roll7_mean"] = gdf[TARGET].tail(7).mean() if len(gdf) > 0 else 0

            yhat = float(model.predict(fe[feature_cols])[0])
            yhat = max(0.0, yhat)

            gdf = pd.concat([
                gdf,
                pd.DataFrame({"date": [d], "location": [loc], "goods_type": [goods], TARGET: [yhat]})
            ], ignore_index=True)

            all_preds.append({
                "date": d.date().isoformat(),
                "location": loc,
                "goods_type": goods,
                "predicted_wagons": round(yhat),
            })

    return pd.DataFrame(all_preds)


def main():
    if not os.path.exists(DATA_CSV):
        print(f"Data not found: {DATA_CSV}. Run freight_demand_data.py first.")
        sys.exit(1)
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found: {MODEL_PATH}. Train it with freight_demand_train.py first.")
        sys.exit(1)

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    feature_cols = artifact["feature_cols"]

    hist = pd.read_csv(DATA_CSV, parse_dates=["date"])  # date, location, goods_type, wagons_required

    preds = recursive_forecast(model, feature_cols, hist, horizon_days=30)
    preds = preds.sort_values(["location", "goods_type", "date"]).reset_index(drop=True)
    preds.to_csv(OUT_CSV, index=False)
    print(f"Saved 30-day forecast to {OUT_CSV} with {len(preds)} rows")


if __name__ == "__main__":
    main()