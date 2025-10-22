import os
import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime
from sklearn.metrics import classification_report, confusion_matrix
import warnings

# --- Filter Warnings ---
warnings.filterwarnings("ignore", message="X does not have valid feature names, but.*was fitted with feature names", category=UserWarning)

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

# --- Define Paths ---
try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), os.pardir))

OUTPUT_DIR = os.path.join(BASE_DIR, "ml")
DATASET_DIR = os.path.join(BASE_DIR, "datasets")

CLASSIFIER_PATH = os.path.join(OUTPUT_DIR, "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_preprocessor.pkl")
DELAY_TEST_PATH = os.path.join(DATASET_DIR, "delay_test.csv")

# --- Load Models ---
logging.info("[INFO] Loading models...")
try:
    clf = joblib.load(CLASSIFIER_PATH)
    if os.path.exists(REGRESSOR_PATH):
        reg = joblib.load(REGRESSOR_PATH)
        logging.info("[INFO] Regressor loaded.")
    else:
        reg = None
        logging.warning("[WARN] Regressor model not found. Predicting duration unavailable/default.")
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    logging.info("[INFO] Models loaded successfully.")
except FileNotFoundError as e:
    logging.error(f"[ERROR] Could not load model or preprocessor: {e}. Ensure training script ran.")
    exit()
except Exception as e:
    logging.error(f"[ERROR] An unexpected error occurred loading models: {e}")
    exit()

# --- Main Execution Block ---
if __name__ == "__main__":
    logging.info("[INFO] Loading test data from %s...", DELAY_TEST_PATH)
    try:
        test_data_raw = pd.read_csv(DELAY_TEST_PATH)
    except FileNotFoundError:
        logging.error(f"[ERROR] Test data not found at {DELAY_TEST_PATH}. Aborting.")
        exit()
    except Exception as e:
        logging.error(f"[ERROR] Failed to load test data: {e}")
        exit()

    # Make a copy to work with
    test_data = test_data_raw.copy()

    # === STEP 1: ADD TIME FEATURES ===
    time_col = 'actual_departure_time'
    if time_col not in test_data.columns:
         logging.error(f"[ERROR] Required time column '{time_col}' not found in test data.")
         exit()
    try:
        test_data[time_col] = pd.to_datetime(test_data[time_col])
        test_data['departure_hour'] = test_data[time_col].dt.hour.astype(float)
        test_data['departure_dayofweek'] = test_data[time_col].dt.weekday.astype(str)
        logging.info("[INFO] Added departure_hour and departure_dayofweek features.")
    except Exception as e:
        logging.error(f"[ERROR] Failed to create time features in test data: {e}")
        exit()

    # === STEP 2: CLEAN CATEGORICAL FEATURES (including new ones) ===
    # *** Use train_type here ***
    categorical_cols_to_clean = ["weather_impact", "track_status", "train_type", "departure_dayofweek"]
    for col in categorical_cols_to_clean:
        if col in test_data.columns:
             test_data[col] = test_data[col].astype(str).str.strip().replace('nan', 'Unknown')
        else:
             logging.warning(f"[WARN] Expected categorical column '{col}' not found for cleaning.")

    # === STEP 3: SELECT ONLY THE FEATURES NEEDED FOR PREPROCESSING ===
    # *** Use train_type here ***
    expected_feature_cols = [
        "track_status", "weather_impact", "train_type", # CORRECTED
        "priority_level", "coach_length", "max_speed_kmph",
        "departure_hour", "departure_dayofweek"
    ]
    missing_in_input = [col for col in expected_feature_cols if col not in test_data.columns]
    if missing_in_input:
        logging.error(f"[ERROR] Test data is missing expected columns after feature creation: {missing_in_input}")
        exit()

    input_features_df = test_data[expected_feature_cols]

    # === STEP 4: APPLY PREPROCESSOR ===
    try:
        logging.info("[INFO] Transforming input data using loaded preprocessor...")
        X_test_transformed = preprocessor.transform(input_features_df)
        logging.info("[INFO] Data transformed successfully.")
    except ValueError as e:
        logging.error(f"[ERROR] Error transforming data: {e}. Check column consistency with training.")
        try:
             expected_names = preprocessor.get_feature_names_out()
             logging.error(f"Preprocessor expects features derived from columns like: {expected_names[:10]}...") # Show some expected
        except:
             logging.error("Could not retrieve expected feature names from preprocessor.")
        logging.error(f"Columns provided to transform: {list(input_features_df.columns)}")
        exit()
    except Exception as e:
        logging.error(f"[ERROR] An unexpected error occurred during preprocessing: {e}")
        exit()

    # === STEP 5: RUN PREDICTIONS on transformed data ===
    logging.info("[INFO] Running predictions...")
    class_pred, class_proba, reg_pred = None, None, None
    try:
        class_pred = clf.predict(X_test_transformed)
        class_proba = clf.predict_proba(X_test_transformed)[:, 1]

        reg_pred = np.full(len(input_features_df), 0.0) # Default
        if reg:
            reg_pred_raw = reg.predict(X_test_transformed)
            reg_pred = np.maximum(0, reg_pred_raw)
        logging.info("[INFO] Predictions completed.")
    except Exception as e:
        logging.error(f"[ERROR] An error occurred during model prediction: {e}")
        class_pred = class_pred if class_pred is not None else np.full(len(input_features_df), -1)
        class_proba = class_proba if class_proba is not None else np.full(len(input_features_df), np.nan)
        reg_pred = reg_pred if reg_pred is not None else np.full(len(input_features_df), np.nan)


    # === STEP 6: COMBINE RESULTS and Evaluate ===
    preds_df = test_data_raw.copy()
    preds_df["pred_delayed_flag"] = class_pred
    preds_df["delay_probability"] = class_proba
    preds_df["predicted_delay_minutes"] = reg_pred

    # *** Use train_id first ***
    id_col = "train_id" # EXPECT train_id now
    if id_col not in preds_df.columns:
         logging.warning(f"[WARN] Identifier column '{id_col}' not found. Using row index.")
         preds_df[id_col] = preds_df.index

    has_true_values = ("delayed_flag" in preds_df.columns and "delay_minutes" in preds_df.columns)
    if not has_true_values:
        logging.warning("[WARN] True delay columns missing in test data. Cannot show 'Actual' or evaluate fully.")

    # Format Output Table
    output_rows = []
    for idx, row in preds_df.iterrows():
        train_id = row[id_col]
        pred_flag = int(row["pred_delayed_flag"]) if pd.notna(row["pred_delayed_flag"]) else -1
        pred_minutes_val = row["predicted_delay_minutes"]
        pred_minutes = int(round(pred_minutes_val)) if pd.notna(pred_minutes_val) and pred_minutes_val >= 0 else 'N/A' # Check >= 0

        if pred_flag == 1:
            pred_status = f"Delayed by {pred_minutes} min"
        elif pred_flag == 0:
            pred_status = "On Time"
        else:
             pred_status = "Prediction Error"

        true_status = "N/A"
        if has_true_values:
            true_flag = int(row["delayed_flag"])
            true_minutes = int(row["delay_minutes"])
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
    logging.info("\n=== Train Delay Predictions ===")
    with pd.option_context('display.max_rows', None):
        print(output_df.to_string(index=False))

    # Show Evaluation Metrics
    if has_true_values and -1 not in preds_df["pred_delayed_flag"].unique():
        logging.info("\n=== Classification Report ===")
        print(classification_report(
            preds_df["delayed_flag"], preds_df["pred_delayed_flag"], zero_division=0))

        logging.info("\n=== Confusion Matrix ===")
        print(confusion_matrix(
            preds_df["delayed_flag"], preds_df["pred_delayed_flag"]))
    elif not has_true_values:
         logging.info("Skipping evaluation metrics as true labels are missing.")
    else:
         logging.info("Skipping evaluation metrics due to prediction errors.")