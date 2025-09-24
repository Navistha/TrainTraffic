import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score, classification_report

# Corrected path: Hardcoded absolute path
# This path must be the full and correct location of your file.


import os

# Base = backend folder (go 2 levels up from booking/ml_models/)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Dataset
DATA_PATH = os.path.join(BASE_DIR, "datasets", "freight_data.csv")

# Output
OUTPUT_DIR = os.path.join(BASE_DIR, "ml")

# Models
CLASSIFIER_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "delay_classifier.pkl")
REGRESSOR_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "delay_regressor.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "booking", "ml_models", "delay_preprocessor.pkl")

print("[DEBUG] DATA_PATH =", DATA_PATH)



print("[INFO] Loading dataset...")
try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    print(f"Error: The file was not found at the expected path: {DATA_PATH}")
    exit()

# Clean categorical columns (remove trailing spaces)
for col in ["weather_impact", "track_status", "freight_type"]:
    df[col] = df[col].astype(str).str.strip()

feature_cols = [
    "track_status",
    "weather_impact",
    "freight_type",
    "priority_level",
    "coach_length",
    "max_speed_kmph"
]
X = df[feature_cols]
y_class = df["delayed_flag"]
y_reg = df["delay_minutes"]

numeric_cols = ["priority_level", "coach_length", "max_speed_kmph"]
categorical_cols = ["track_status", "weather_impact", "freight_type"]

numeric_pipe = Pipeline([("imputer", SimpleImputer(strategy="median"))])
categorical_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_pipe, numeric_cols),
        ("cat", categorical_pipe, categorical_cols),
    ],
    remainder="drop",
    sparse_threshold=0
)

try:
    X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
        X, y_class, y_reg, test_size=0.2, random_state=42, stratify=y_class
    )
except Exception as e:
    print("[WARN] Stratified split failed:", e)
    print("[INFO] Falling back to non-stratified split.")
    X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
        X, y_class, y_reg, test_size=0.2, random_state=42
    )

print("\n[INFO] Class distribution in training set:")
print(y_class_train.value_counts())

# Build classifier pipeline
clf_pipe = Pipeline([
    ("pre", preprocessor),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1, class_weight="balanced"))
])

# Hyperparameter grid for classifier
clf_param_grid = {
    "clf__n_estimators": [100, 200, 300],
    "clf__max_depth": [None, 5, 10, 20],
    "clf__min_samples_split": [2, 5, 10],
    "clf__min_samples_leaf": [1, 2, 4]
}

clf_search = RandomizedSearchCV(
    clf_pipe, clf_param_grid, n_iter=10, cv=3, scoring="f1", random_state=42, n_jobs=-1, verbose=1
)
print("[INFO] Tuning classifier...")
clf_search.fit(X_train, y_class_train)
clf_best = clf_search.best_estimator_

# Build regressor pipeline
reg_pipe = Pipeline([
    ("pre", preprocessor),
    ("reg", RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1))
])

# Hyperparameter grid for regressor
reg_param_grid = {
    "reg__n_estimators": [100, 200, 300],
    "reg__max_depth": [None, 5, 10, 20],
    "reg__min_samples_split": [2, 5, 10],
    "reg__min_samples_leaf": [1, 2, 4]
}

reg_search = RandomizedSearchCV(
    reg_pipe, reg_param_grid, n_iter=10, cv=3, scoring="neg_root_mean_squared_error", random_state=42, n_jobs=-1, verbose=1
)
print("[INFO] Tuning regressor...")
reg_search.fit(X_train, y_reg_train)
reg_best = reg_search.best_estimator_

# Evaluate classifier
y_class_pred = clf_best.predict(X_test)
acc = accuracy_score(y_class_test, y_class_pred)
f1 = f1_score(y_class_test, y_class_pred, zero_division=0)
print("\n=== Classifier ===")
print(f"Accuracy: {acc:.4f}")
print(f"F1 Score: {f1:.4f}")
print(classification_report(y_class_test, y_class_pred))

# Evaluate regressor
y_reg_pred = reg_best.predict(X_test)
mse = mean_squared_error(y_reg_test, y_reg_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_reg_test, y_reg_pred)
print("\n=== Regressor ===")
print(f"RMSE: {rmse:.4f}")
print(f"R²: {r2:.4f}")

# Save models and fitted preprocessor
# Note: The `os` module is still needed for this part.
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

joblib.dump(clf_best.named_steps["clf"], CLASSIFIER_PATH)
joblib.dump(reg_best.named_steps["reg"], REGRESSOR_PATH)
# Save the fitted preprocessor from the classifier pipeline
joblib.dump(clf_best.named_steps["pre"], PREPROCESSOR_PATH)

print("\n[INFO] Saved models:")
print(f" - Classifier: {CLASSIFIER_PATH}")
print(f" - Regressor: {REGRESSOR_PATH}")
print(f" - Preprocessor: {PREPROCESSOR_PATH}")

# Feature importances
print("\n[INFO] Feature importances (Classifier):")
importances = clf_best.named_steps["clf"].feature_importances_
feature_names = (
    numeric_cols +
    list(clf_best.named_steps["pre"].transformers_[1][1].named_steps["onehot"].get_feature_names_out(categorical_cols))
)
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"{name}: {imp:.3f}")