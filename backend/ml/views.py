import os
import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Import necessary models if needed (e.g., to fetch default data)
# from core.models import Train

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

# --- Define Paths ---
try:
    # Assumes views.py is in backend/ml
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    BASE_DIR = os.path.abspath(os.path.join(os.getcwd())) # Fallback for different execution contexts

OUTPUT_DIR = os.path.join(BASE_DIR, "ml")
CLASSIFIER_PATH = os.path.join(OUTPUT_DIR, "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_preprocessor.pkl")

# --- Load Models Globally (Load once when Django starts) ---
clf = None
reg = None
preprocessor = None
models_loaded = False
try:
    logging.info("[INFO] Loading ML models for API...")
    clf = joblib.load(CLASSIFIER_PATH)
    if os.path.exists(REGRESSOR_PATH):
        reg = joblib.load(REGRESSOR_PATH)
        logging.info("[INFO] Regressor loaded for API.")
    else:
        logging.warning("[WARN] Regressor model not found for API.")
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    models_loaded = True
    logging.info("[INFO] ML models loaded successfully for API.")
except FileNotFoundError as e:
    logging.error(f"[ERROR] Could not load ML model or preprocessor for API: {e}. Predictions disabled.")
except Exception as e:
    logging.error(f"[ERROR] Unexpected error loading ML models for API: {e}. Predictions disabled.")


# --- API View ---
class PredictTrainDelay(APIView):
    # permission_classes = [IsAuthenticated] # Uncomment if authentication is needed

    def post(self, request, *args, **kwargs):
        if not models_loaded:
            return Response(
                {"error": "ML models are not loaded. Prediction unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Expecting data like: {"train_id": "SIM0001", "track_status": "free", ...}
        input_data = request.data
        if not input_data:
             return Response({"error": "No input data provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Convert single record to DataFrame
        try:
            input_df = pd.DataFrame([input_data])
        except Exception as e:
             return Response({"error": f"Invalid input data format: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Add Time Features (if needed and applicable for API input) ---
        now = datetime.now()
        if 'departure_hour' not in input_df.columns:
             input_df['departure_hour'] = float(now.hour)
        if 'departure_dayofweek' not in input_df.columns:
             input_df['departure_dayofweek'] = str(now.weekday())

        # --- Clean Categorical ---
        categorical_cols_to_clean = ["weather_impact", "track_status", "train_type", "departure_dayofweek"]
        for col in categorical_cols_to_clean:
            if col in input_df.columns:
                 input_df[col] = input_df[col].astype(str).str.strip().replace('nan', 'Unknown')
            else:
                 # Handle missing optional categorical features if needed
                 if col in ["weather_impact", "track_status", "train_type"]:
                      input_df[col] = 'Unknown'
                      logging.warning(f"Missing optional feature '{col}', defaulting to 'Unknown'.")

        # --- Select Features for Preprocessor ---
        expected_feature_cols = [
            "track_status", "weather_impact", "train_type",
            "priority_level", "coach_length", "max_speed_kmph",
            "departure_hour", "departure_dayofweek"
        ]

        missing_mandatory = [col for col in expected_feature_cols if col not in input_df.columns]
        if missing_mandatory:
             # Add default values for missing features before erroring, maybe?
             # For now, let's strictly require them.
             # Example: Add defaults if priority_level is missing
             # if 'priority_level' in missing_mandatory: input_df['priority_level'] = 3 # Default priority
             # Recheck missing after adding defaults...
             # Re-calculate missing_mandatory = [...]
             # if missing_mandatory: # If still missing after defaults
                 return Response(
                      {"error": f"Missing required input features: {missing_mandatory}"},
                      status=status.HTTP_400_BAD_REQUEST
                 )

        input_features_df = input_df[expected_feature_cols]


        # --- Apply Preprocessor ---
        try:
            X_transformed = preprocessor.transform(input_features_df)
        except ValueError as e:
            logging.error(f"[ERROR] API - Error transforming data: {e}. Input: {input_data}")
            return Response(
                 {"error": f"Data transformation error: {e}. Check input values and types."},
                 status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
             logging.error(f"[ERROR] API - Unexpected preprocessing error: {e}")
             return Response(
                  {"error": "Internal server error during data preprocessing."},
                  status=status.HTTP_500_INTERNAL_SERVER_ERROR
             )

        # --- Run Predictions ---
        try:
            class_pred = clf.predict(X_transformed)
            class_proba = clf.predict_proba(X_transformed)[:, 1]

            reg_pred = np.array([0.0]) # Default
            if reg:
                reg_pred_raw = reg.predict(X_transformed)
                reg_pred = np.maximum(0, reg_pred_raw)

        except Exception as e:
            logging.error(f"[ERROR] API - Error during model prediction: {e}")
            return Response(
                 {"error": "Internal server error during prediction."},
                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # --- Format Response ---
        result = {
            "predicted_delayed_flag": int(class_pred[0]),
            "delay_probability": float(class_proba[0]),
            "predicted_delay_minutes": float(round(reg_pred[0], 2)) if pd.notna(reg_pred[0]) else None
        }

        return Response(result, status=status.HTTP_200_OK)