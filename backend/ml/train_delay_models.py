import os
import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime

# --- Corrected Imports ---
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score, classification_report
import lightgbm as lgb # Import LightGBM

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

# --- Define Paths ---
# Assuming BASE_DIR is the 'backend' directory for path calculations relative to manage.py
# If running directly, adjust BASE_DIR definition if needed.
try:
    # This works if run via manage.py or if script is in 'backend/ml'
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    # Fallback if __file__ is not defined (e.g., interactive session)
    BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), os.pardir))

# Make sure DATA_PATH points to the correct (potentially balanced) data file
DATA_PATH = os.path.join(BASE_DIR, "datasets", "train_delay_data.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "ml") # Save models inside 'backend/ml'

CLASSIFIER_PATH = os.path.join(OUTPUT_DIR, "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(OUTPUT_DIR, "delay_preprocessor.pkl")

# --- Main Training Function ---
def train_and_evaluate():
    logging.info("[INFO] Loading dataset from %s...", DATA_PATH)
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        logging.error("[ERROR] Dataset not found at %s. Please ensure the file exists.", DATA_PATH)
        return

    # Clean categorical columns (remove trailing spaces) and handle potential NaN explicitly
    categorical_cols_to_clean = ["weather_impact", "track_status", "train_type"]
    for col in categorical_cols_to_clean:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().replace('nan', 'Unknown') # Replace 'nan' string
        else:
            logging.warning(f"[WARN] Expected categorical column '{col}' not found in dataset.")

    # Define feature columns expected by the model
    feature_cols = [
        "track_status",
        "weather_impact",
        "train_type",
        "priority_level",
        "coach_length",
        "max_speed_kmph"
    ]
    
    # Check if all feature columns exist
    missing_features = [col for col in feature_cols if col not in df.columns]
    if missing_features:
        logging.error(f"[ERROR] Missing required feature columns: {missing_features}. Aborting.")
        return
        
    # Check target columns exist
    if "delayed_flag" not in df.columns or "delay_minutes" not in df.columns:
        logging.error("[ERROR] Missing target columns 'delayed_flag' or 'delay_minutes'. Aborting.")
        return

    X = df[feature_cols]
    y_class = df["delayed_flag"]
    y_reg = df["delay_minutes"]

    # --- Preprocessing Setup (Remains the same) ---
    numeric_cols = ["priority_level", "coach_length", "max_speed_kmph"]
    categorical_cols = ["track_status", "weather_impact", "train_type"]

    # Ensure specified columns actually exist in X before using them
    actual_numeric_cols = [col for col in numeric_cols if col in X.columns]
    actual_categorical_cols = [col for col in categorical_cols if col in X.columns]
    
    if not actual_numeric_cols:
         logging.warning("[WARN] No numeric features found for preprocessing.")
    if not actual_categorical_cols:
         logging.warning("[WARN] No categorical features found for preprocessing.")

    numeric_pipe = Pipeline([("imputer", SimpleImputer(strategy="median"))])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")), # Handles potential explicit 'Unknown' category
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, actual_numeric_cols),
            ("cat", categorical_pipe, actual_categorical_cols),
        ],
        remainder="drop", # Drop any columns not specified
        sparse_threshold=0
    )

    # --- Train/Test Split (Remains the same) ---
    try:
        # Attempt stratified split first for classification balance in test set
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


    # === MODIFIED: Classifier using LightGBM ===
    logging.info("[INFO] Setting up LGBM Classifier pipeline...")
    clf_pipe = Pipeline([
        ("pre", preprocessor),
        # Use scale_pos_weight for imbalance instead of class_weight if needed,
        # but balanced data + default handling is often okay.
        # Check y_class_train distribution to decide if scale_pos_weight is needed.
        ("clf", lgb.LGBMClassifier(random_state=42, n_jobs=-1)) # Using LGBMClassifier
    ])

    # Hyperparameter grid for LightGBM classifier
    clf_param_grid_lgbm = {
        "clf__n_estimators": [100, 200, 300],
        "clf__learning_rate": [0.05, 0.1, 0.2],
        "clf__num_leaves": [20, 31, 40],      # Usually < 2^max_depth
        "clf__max_depth": [-1, 10, 20],
        "clf__reg_alpha": [0, 0.1, 0.5],     # L1 regularization
        "clf__reg_lambda": [0, 0.1, 0.5],    # L2 regularization
        # 'class_weight': ['balanced'] # Can try adding this here too
    }

    # Use RandomizedSearchCV
    clf_search = RandomizedSearchCV(
        clf_pipe, clf_param_grid_lgbm, n_iter=20, cv=3, scoring="f1_weighted", # Using weighted F1 for tuning
        random_state=42, n_jobs=-1, verbose=1
    )
    logging.info("[INFO] Tuning LGBM classifier...")
    try:
        clf_search.fit(X_train, y_class_train) # Train tuner
        clf_best = clf_search.best_estimator_
        logging.info(f"[INFO] Best LGBM classifier params: {clf_search.best_params_}")
    except Exception as e:
        logging.error("[ERROR] Failed during classifier tuning: %s", e)
        return


    # === MODIFIED: Regressor using LightGBM ===
    logging.info("[INFO] Setting up LGBM Regressor pipeline...")
    reg_pipe = Pipeline([
        ("pre", preprocessor),
        ("reg", lgb.LGBMRegressor(random_state=42, n_jobs=-1)) # Using LGBMRegressor
    ])

    # Hyperparameter grid for LightGBM regressor
    reg_param_grid_lgbm = {
        "reg__n_estimators": [100, 200, 300],
        "reg__learning_rate": [0.05, 0.1, 0.2],
        "reg__num_leaves": [20, 31, 40],
        "reg__max_depth": [-1, 10, 20],
        "reg__reg_alpha": [0, 0.1, 0.5],
        "reg__reg_lambda": [0, 0.1, 0.5],
    }

    # Use RandomizedSearchCV
    reg_search = RandomizedSearchCV(
        reg_pipe, reg_param_grid_lgbm, n_iter=20, cv=3, scoring="neg_root_mean_squared_error",
        random_state=42, n_jobs=-1, verbose=1
    )
    logging.info("[INFO] Tuning LGBM regressor...")
    try:
        # Fit only on rows where delay > 0 for potentially better regression on actual delays
        X_train_reg = X_train[y_reg_train > 0]
        y_reg_train_reg = y_reg_train[y_reg_train > 0]
        if not X_train_reg.empty:
            reg_search.fit(X_train_reg, y_reg_train_reg) # Train tuner only on delayed samples
            reg_best = reg_search.best_estimator_
            logging.info(f"[INFO] Best LGBM regressor params: {reg_search.best_params_}")
        else:
            logging.warning("[WARN] No delayed samples in training data for regressor tuning. Skipping.")
            reg_best = None # No regressor trained
    except Exception as e:
        logging.error("[ERROR] Failed during regressor tuning: %s", e)
        return


    # === Evaluate Models ===
    logging.info("\n=== Classifier Evaluation (on Test Set) ===")
    try:
        y_class_pred = clf_best.predict(X_test)
        acc = accuracy_score(y_class_test, y_class_pred)
        # Use weighted F1 for overall performance, especially if test set is imbalanced
        f1_weighted = f1_score(y_class_test, y_class_pred, average='weighted', zero_division=0)
        logging.info(f"Accuracy: {acc:.4f}")
        logging.info(f"Weighted F1 Score: {f1_weighted:.4f}")
        print(classification_report(y_class_test, y_class_pred, zero_division=0))
    except Exception as e:
        logging.error("[ERROR] Failed during classifier evaluation: %s", e)

    logging.info("\n=== Regressor Evaluation (on Test Set - Delayed Samples Only) ===")
    if reg_best:
        try:
            # Evaluate regressor only on the test samples that were actually delayed
            X_test_reg = X_test[y_reg_test > 0]
            y_reg_test_reg = y_reg_test[y_reg_test > 0]

            if not X_test_reg.empty:
                y_reg_pred = reg_best.predict(X_test_reg)
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
        logging.info("[INFO] Regressor was not trained (no delayed samples in training data).")


    # === Save Models and Fitted Preprocessor ===
    logging.info("\n[INFO] Saving models and preprocessor...")
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        # Save the best *fitted* classifier and regressor models
        joblib.dump(clf_best.named_steps["clf"], CLASSIFIER_PATH)
        if reg_best:
            joblib.dump(reg_best.named_steps["reg"], REGRESSOR_PATH)
        # Save the fitted preprocessor (important!) from one of the pipelines
        joblib.dump(clf_best.named_steps["pre"], PREPROCESSOR_PATH)

        logging.info("[INFO] Saved models:")
        logging.info(f" - Classifier:   {CLASSIFIER_PATH}")
        if reg_best:
            logging.info(f" - Regressor:    {REGRESSOR_PATH}")
        logging.info(f" - Preprocessor: {PREPROCESSOR_PATH}")
    except Exception as e:
        logging.error("[ERROR] Failed to save models: %s", e)


    # === Feature Importances (Using LGBM's method) ===
    logging.info("\n[INFO] Feature importances (LGBM Classifier):")
    try:
        importances = clf_best.named_steps["clf"].feature_importances_
        # Get feature names after one-hot encoding
        preprocessor_fitted = clf_best.named_steps["pre"]
        
        # Try getting feature names directly (newer scikit-learn)
        try:
             feature_names_raw = list(preprocessor_fitted.get_feature_names_out())
             # Clean prefixes like 'num__', 'cat__'
             feature_names = [name.split('__')[-1] for name in feature_names_raw]
        except AttributeError:
             # Fallback for older scikit-learn versions
             logging.warning("[WARN] Using fallback method for feature names.")
             numeric_feature_names = actual_numeric_cols
             # Get categorical names after one-hot encoding
             categorical_feature_names = list(preprocessor_fitted.transformers_[1][1] # cat pipeline
                                              .named_steps["onehot"] # onehot step
                                              .get_feature_names_out(actual_categorical_cols)) # get names
             feature_names = numeric_feature_names + categorical_feature_names

        # Match importances to names
        if len(importances) == len(feature_names):
             feature_importance_dict = dict(zip(feature_names, importances))
             # Sort by importance (descending)
             sorted_features = sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True)
             for name, imp in sorted_features:
                  print(f"{name}: {imp}") # Use raw importance value for LGBM
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