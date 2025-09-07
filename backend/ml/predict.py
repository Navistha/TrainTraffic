import os
import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "ml")
DATASET_DIR = os.path.join(BASE_DIR, "datasets")

CLASSIFIER_PATH = os.path.join(OUTPUT_DIR, "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_preprocessor.pkl")
DELAY_TEST_PATH = os.path.join(DATASET_DIR, "delay_test.csv")

print("[INFO] Loading models...")
clf = joblib.load(CLASSIFIER_PATH)
reg = joblib.load(REGRESSOR_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)
print("[INFO] Models loaded successfully.")

def predict_delay(input_df: pd.DataFrame):
    X_t = preprocessor.transform(input_df)
    class_pred = clf.predict(X_t)
    class_proba = clf.predict_proba(X_t)[:, 1]
    reg_pred = reg.predict(X_t)
    results = input_df.copy()
    results["pred_delayed_flag"] = class_pred
    results["delay_probability"] = class_proba
    results["predicted_delay_minutes"] = reg_pred
    return results

if __name__ == "__main__":
    test_data = pd.read_csv(DELAY_TEST_PATH)

    # Clean up categorical values (remove trailing spaces)
    for col in ["weather_impact", "track_status", "train_type"]:
        test_data[col] = test_data[col].astype(str).str.strip()

    feature_cols = [
        "track_status",
        "weather_impact",
        "train_type",
        "priority_level",
        "coach_length",
        "max_speed_kmph"
    ]
    input_data = test_data[feature_cols]

    preds = predict_delay(input_data)
    preds["train_id"] = test_data["train_id"]
    preds["true_delayed_flag"] = test_data["delayed_flag"]
    preds["true_delay_minutes"] = test_data["delay_minutes"]

    # Prepare readable output with true and predicted status
    output_rows = []
    for idx, row in preds.iterrows():
        train_id = row["train_id"]
        pred_flag = int(row["pred_delayed_flag"])
        pred_minutes = int(round(row["predicted_delay_minutes"]))
        true_flag = int(row["true_delayed_flag"])
        true_minutes = int(row["true_delay_minutes"])
        if pred_flag == 1:
            pred_status = f"Delayed by {pred_minutes} min"
        else:
            pred_status = "On Time"
        if true_flag == 1:
            true_status = f"Delayed by {true_minutes} min"
        else:
            true_status = "On Time"
        output_rows.append({
            "Train ID": train_id,
            "Predicted": pred_status,
            "Actual": true_status
        })

    output_df = pd.DataFrame(output_rows)
    print("\n=== Train Delay Predictions ===")
    print(output_df.to_string(index=False))

    # Show evaluation
    print("\n=== Classification Report ===")
    print(classification_report(
        preds["true_delayed_flag"], preds["pred_delayed_flag"], zero_division=0))
    print("\n=== Confusion Matrix ===")
    print(confusion_matrix(
        preds["true_delayed_flag"], preds["pred_delayed_flag"]))