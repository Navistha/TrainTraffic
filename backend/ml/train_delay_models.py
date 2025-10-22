import os
import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime
import warnings

# --- ML Imports ---
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, FunctionTransformer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score, classification_report
import lightgbm as lgb
import xgboost as xgb

# --- Filter Warnings ---
# Ignore the specific "No further splits" warning from LightGBM
warnings.filterwarnings("ignore", message="No further splits with positive gain, best gain: -inf", category=UserWarning) # Use UserWarning, more general
warnings.filterwarnings("ignore", message="X does not have valid feature names, but.*was fitted with feature names", category=UserWarning)

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

# --- Define Paths ---
try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), os.pardir))

# Use the original data file name (now overwritten with balanced data)
DATA_PATH = os.path.join(BASE_DIR, "datasets", "train_delay_data.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "ml")

CLASSIFIER_PATH = os.path.join(OUTPUT_DIR, "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_preprocessor.pkl")

# --- Function for Cyclical Encoding (for Hour) ---
# Converts hour (0-23) into two features representing cyclical nature (sin/cos)
def sin_transformer(period):
    return FunctionTransformer(lambda x: np.sin(x / period * 2 * np.pi))

def cos_transformer(period):
    return FunctionTransformer(lambda x: np.cos(x / period * 2 * np.pi))

# --- Main Training Function ---
def train_and_evaluate():
    logging.info("[INFO] Loading dataset from %s...", DATA_PATH)
    try:
        df = pd.read_csv(DATA_PATH)
        # Ensure correct dtypes after loading
        if 'departure_hour' in df.columns: df['departure_hour'] = df['departure_hour'].astype(float)
        if 'departure_dayofweek' in df.columns: df['departure_dayofweek'] = df['departure_dayofweek'].astype(str) # Treat day as categorical
    except FileNotFoundError:
        logging.error("[ERROR] Dataset not found at %s. Please generate it first.", DATA_PATH)
        return
    except Exception as e:
        logging.error("[ERROR] Failed to load or process dataset: %s", e)
        return

    # Clean categorical columns
    categorical_cols_to_clean = ["weather_impact", "track_status", "train_type", "departure_dayofweek"]
    for col in categorical_cols_to_clean:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().replace('nan', 'Unknown')
        else:
            logging.warning(f"[WARN] Expected categorical column '{col}' not found in dataset.")

    # --- Define Features including NEW Time Features ---
    feature_cols = [
        "track_status",
        "weather_impact",
        "train_type",
        "priority_level",
        "coach_length",
        "max_speed_kmph",
        "departure_hour",       # NEW
        "departure_dayofweek"   # NEW
    ]

    missing_features = [col for col in feature_cols if col not in df.columns]
    if missing_features:
        logging.error(f"[ERROR] Missing required feature columns: {missing_features}. Aborting.")
        return

    if "delayed_flag" not in df.columns or "delay_minutes" not in df.columns:
        logging.error("[ERROR] Missing target columns 'delayed_flag' or 'delay_minutes'. Aborting.")
        return

    X = df[feature_cols]
    y_class = df["delayed_flag"]
    y_reg = df["delay_minutes"]

    # --- UPDATED Preprocessing Setup ---
    # Original numeric features
    numeric_cols = ["priority_level", "coach_length", "max_speed_kmph"]
    # Original categorical features + DayOfWeek
    categorical_cols = ["track_status", "weather_impact", "train_type", "departure_dayofweek"]
    # Hour feature for cyclical encoding
    cyclical_cols = ["departure_hour"]

    # Ensure columns exist in X
    actual_numeric_cols = [col for col in numeric_cols if col in X.columns]
    actual_categorical_cols = [col for col in categorical_cols if col in X.columns]
    actual_cyclical_cols = [col for col in cyclical_cols if col in X.columns]

    # Pipeline for standard numeric features
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()) # Scale numeric features
    ])

    # Pipeline for standard categorical features
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    # Pipeline for cyclical hour feature (0-23 hours cycle)
    cyclical_pipe = Pipeline([
        ('sin', sin_transformer(24)),
        ('cos', cos_transformer(24))
        # No scaler needed as sin/cos are already in [-1, 1] range
    ])

    # Combine transformers
    transformers_list = []
    if actual_numeric_cols:
        transformers_list.append(("num", numeric_pipe, actual_numeric_cols))
    if actual_categorical_cols:
        transformers_list.append(("cat", categorical_pipe, actual_categorical_cols))
    if actual_cyclical_cols:
        # Apply cyclical transform directly to the hour column
        # Note: Needs adjustment if SimpleImputer is required for hour
        preprocessor_hour_only = Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', StandardScaler())]) # Impute and scale hour first if needed
        hour_processor = Pipeline([
             ('impute_scale', preprocessor_hour_only), # Preprocess hour like other numerics first
             ('cyclical', cyclical_pipe) # Then apply sin/cos
             # Update: Applying sin/cos directly might be better. Let's try that.
        ])

        # Simpler cyclical pipe - apply directly after imputation
        hour_imputer = SimpleImputer(strategy='median')
        hour_cyclical_processor = Pipeline([
            ('imputer', hour_imputer),
            ('sin', sin_transformer(24)),
            ('cos', cos_transformer(24)),
        ])
        # Need to handle the output shape of FunctionTransformer for ColumnTransformer...
        # Let's treat HOUR as CATEGORICAL for simplicity first, then refine if needed.

        # --- REVISED Simpler Preprocessing ---
        numeric_cols_revised = ["priority_level", "coach_length", "max_speed_kmph"]
        # Treat hour and day as categorical
        categorical_cols_revised = ["track_status", "weather_impact", "train_type", "departure_hour", "departure_dayofweek"]

        actual_numeric_cols = [col for col in numeric_cols_revised if col in X.columns]
        actual_categorical_cols = [col for col in categorical_cols_revised if col in X.columns]

        numeric_pipe_revised = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ])
        categorical_pipe_revised = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_pipe_revised, actual_numeric_cols),
                ("cat", categorical_pipe_revised, actual_categorical_cols),
            ],
            remainder="drop",
            sparse_threshold=0
        )
        logging.info("[INFO] Preprocessing setup complete (treating hour/day as categorical).")

    # --- Train/Test Split ---
    try:
        X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
            X, y_class, y_reg, test_size=0.2, random_state=42, stratify=y_class
        )
        logging.info("[INFO] Using stratified train/test split.")
    except Exception as e:
        logging.warning("[WARN] Stratified split failed: %s", e)
        logging.info("[INFO] Falling back to non-stratified split.")
        X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
            X, y_class, y_reg, test_size=0.2, random_state=42
        )

    logging.info("\n[INFO] Class distribution in training set:")
    logging.info(y_class_train.value_counts())
    logging.info("\n[INFO] Class distribution in test set:")
    logging.info(y_class_test.value_counts())


    # === Classifier using LightGBM (Keep as before) ===
    logging.info("[INFO] Setting up LGBM Classifier pipeline...")
    clf_pipe = Pipeline([
        ("pre", preprocessor),
        ("clf", lgb.LGBMClassifier(random_state=42, n_jobs=-1))
    ])
    clf_param_grid_lgbm = { # Using previous best params as a starting point + variations
        'clf__n_estimators': [100, 200],
        'clf__learning_rate': [0.05, 0.1],
        'clf__num_leaves': [20, 31],
        'clf__max_depth': [10, -1],
        'clf__reg_alpha': [0.1, 0.5],
        'clf__reg_lambda': [0.5, 1.0]
    }
    clf_search = RandomizedSearchCV(
        clf_pipe, clf_param_grid_lgbm, n_iter=10, cv=3, scoring="f1_weighted", # Reduced n_iter for speed
        random_state=42, n_jobs=-1, verbose=1
    )
    logging.info("[INFO] Tuning LGBM classifier...")
    try:
        clf_search.fit(X_train, y_class_train)
        clf_best = clf_search.best_estimator_
        logging.info(f"[INFO] Best LGBM classifier params: {clf_search.best_params_}")
    except Exception as e:
        logging.error("[ERROR] Failed during classifier tuning: %s", e)
        return


    # === Regressor using XGBoost (Keep as before, but uses new features via preprocessor) ===
    logging.info("[INFO] Setting up XGBoost Regressor pipeline...")
    reg_pipe = Pipeline([
        ("pre", preprocessor),
        ("reg", xgb.XGBRegressor(random_state=42, n_jobs=-1, objective='reg:squarederror'))
    ])
    reg_param_grid_xgb = { # Using previous best params as starting point + variations
        'reg__n_estimators': [100, 200],
        'reg__learning_rate': [0.05, 0.1],
        'reg__max_depth': [3, 6],
        'reg__subsample': [0.7, 1.0],
        'reg__colsample_bytree': [0.7, 1.0],
        'reg__reg_alpha': [0.5, 1.0],
        'reg__reg_lambda': [0.5, 1.0]
    }
    reg_search = RandomizedSearchCV(
        reg_pipe, reg_param_grid_xgb, n_iter=10, cv=3, scoring="neg_root_mean_squared_error", # Reduced n_iter
        random_state=42, n_jobs=-1, verbose=1
    )
    logging.info("[INFO] Tuning XGBoost regressor...")
    X_train_reg = X_train[y_reg_train > 0]
    y_reg_train_reg = y_reg_train[y_reg_train > 0]
    reg_best = None
    if not X_train_reg.empty:
        try:
            reg_search.fit(X_train_reg, y_reg_train_reg)
            reg_best = reg_search.best_estimator_
            logging.info(f"[INFO] Best XGBoost regressor params: {reg_search.best_params_}")
        except Exception as e:
            logging.error("[ERROR] Failed during XGBoost regressor tuning: %s", e)
    else:
        logging.warning("[WARN] No delayed samples in training data for regressor tuning.")


    # === Evaluate Models ===
    logging.info("\n=== Classifier Evaluation (on Test Set) ===")
    try:
        y_class_pred = clf_best.predict(X_test)
        acc = accuracy_score(y_class_test, y_class_pred)
        f1_weighted = f1_score(y_class_test, y_class_pred, average='weighted', zero_division=0)
        logging.info(f"Accuracy: {acc:.4f}")
        logging.info(f"Weighted F1 Score: {f1_weighted:.4f}")
        print(classification_report(y_class_test, y_class_pred, zero_division=0))
    except Exception as e:
        logging.error("[ERROR] Failed during classifier evaluation: %s", e)

    logging.info("\n=== Regressor Evaluation (on Test Set - Delayed Samples Only) ===")
    if reg_best:
        try:
            X_test_reg = X_test[y_reg_test > 0]
            y_reg_test_reg = y_reg_test[y_reg_test > 0]
            if not X_test_reg.empty:
                y_reg_pred = reg_best.predict(X_test_reg)
                # Ensure predictions aren't negative
                y_reg_pred = np.maximum(0, y_reg_pred)
                mse = mean_squared_error(y_reg_test_reg, y_reg_pred)
                rmse = np.sqrt(mse)
                r2 = r2_score(y_reg_test_reg, y_reg_pred)
                logging.info(f"RMSE (on delayed test samples): {rmse:.4f}")
                logging.info(f"R² (on delayed test samples): {r2:.4f}")
            else:
                logging.info("[INFO] No delayed samples in test set for regressor evaluation.")
        except Exception as e:
            logging.error("[ERROR] Failed during regressor evaluation: %s", e)
    else:
        logging.info("[INFO] Regressor was not trained or tuning failed.")


    # === Save Models and Fitted Preprocessor ===
    logging.info("\n[INFO] Saving models and preprocessor...")
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        joblib.dump(clf_best.named_steps["clf"], CLASSIFIER_PATH)
        if reg_best:
            joblib.dump(reg_best.named_steps["reg"], REGRESSOR_PATH)
        else:
             logging.warning("[WARN] Regressor model not saved as it was not trained successfully.")
             if os.path.exists(REGRESSOR_PATH):
                  try: os.remove(REGRESSOR_PATH)
                  except OSError: pass # Ignore if file cannot be removed
        # Save the specific preprocessor fitted within the best classifier pipeline
        joblib.dump(clf_best.named_steps["pre"], PREPROCESSOR_PATH)

        logging.info("[INFO] Saved models:")
        logging.info(f" - Classifier:   {CLASSIFIER_PATH}")
        if reg_best:
            logging.info(f" - Regressor:    {REGRESSOR_PATH}")
        logging.info(f" - Preprocessor: {PREPROCESSOR_PATH}")
    except Exception as e:
        logging.error("[ERROR] Failed to save models: %s", e)


    # === Feature Importances (Using LGBM Classifier's method) ===
    logging.info("\n[INFO] Feature importances (LGBM Classifier):")
    try:
        importances = clf_best.named_steps["clf"].feature_importances_
        preprocessor_fitted = clf_best.named_steps["pre"]
        try:
             feature_names_raw = list(preprocessor_fitted.get_feature_names_out())
             feature_names = [name.split('__')[-1] for name in feature_names_raw]
        except AttributeError:
             logging.warning("[WARN] Using fallback method for feature names.")
             numeric_feature_names = actual_numeric_cols
             categorical_feature_names = list(preprocessor_fitted.transformers_[1][1].named_steps["onehot"].get_feature_names_out(actual_categorical_cols))
             feature_names = numeric_feature_names + categorical_feature_names

        if len(importances) == len(feature_names):
             feature_importance_dict = dict(zip(feature_names, importances))
             sorted_features = sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True)
             for name, imp in sorted_features:
                  print(f"{name}: {imp}")
        else:
             logging.warning(f"[WARN] Mismatch between importance count ({len(importances)}) and feature name count ({len(feature_names)}).")
             logging.warning("Importances: %s", importances)
             logging.warning("Feature Names: %s", feature_names)
    except Exception as e:
        logging.error("[ERROR] Failed to calculate or display feature importances: %s", e)

# --- Run the training ---
if __name__ == "__main__":
    start_time = datetime.now()
    train_and_evaluate()
    end_time = datetime.now()
    logging.info(f"\n[INFO] Training script finished in {end_time - start_time}")