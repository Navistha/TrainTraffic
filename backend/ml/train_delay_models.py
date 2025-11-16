import pandas as pd
import numpy as np
import os

try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), os.pardir))

# Use the original data file name (overwritten by the generation script)
DATA_PATH = os.path.join(BASE_DIR, "datasets", "train_delay_data.csv")


# Load dataset (replace 'train_data.csv' with your actual filename)
df = pd.read_csv(DATA_PATH)

# Drop ID and datetime columns not useful for model learning
df = df.drop(columns=["train_id", "actual_arrival_time", "actual_departure_time"])

# Encode categorical columns
cat_cols = ["from_station", "to_station", "track_status", "weather_impact", "train_type"]
df = pd.get_dummies(df, columns=cat_cols, drop_first=True)

# Separate classification and regression targets
X = df.drop(columns=["delay_minutes", "delayed_flag"])
y_class = df["delayed_flag"]           # Classifier target
y_reg = df["delay_minutes"]            # Regressor target

from sklearn.model_selection import train_test_split

X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X, y_class, test_size=0.2, random_state=42, stratify=y_class)
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X, y_reg, test_size=0.2, random_state=42)


from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_c = scaler.fit_transform(X_train_c)
X_test_c = scaler.transform(X_test_c)
X_train_r = scaler.fit_transform(X_train_r)
X_test_r = scaler.transform(X_test_r)


from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, classification_report

param_grid_c = {
    'n_estimators': [100, 200],
    'max_depth': [3, 5],
    'learning_rate': [0.05, 0.1],
    'subsample': [0.8, 1.0]
}

clf = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)

grid_c = GridSearchCV(clf, param_grid_c, cv=3, scoring='accuracy', n_jobs=-1, verbose=2)
grid_c.fit(X_train_c, y_train_c)

print("Best Parameters for Classifier:", grid_c.best_params_)
best_clf = grid_c.best_estimator_

# Evaluate Classifier
y_pred_c = best_clf.predict(X_test_c)
print(f"Accuracy: {accuracy_score(y_test_c, y_pred_c)*100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test_c, y_pred_c))




import xgboost as xgb
from xgboost import XGBRegressor
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np
import pandas as pd
from time import time

print(f"XGBoost version: {xgb.__version__}")

#  Check GPU Support (Modern way)
try:
    test_model = XGBRegressor(tree_method="hist", device="cuda")
    test_model.fit([[0, 0], [1, 1]], [0, 1])
    gpu_supported = True
    print("GPU training enabled (device='cuda').")
except Exception as e:
    gpu_supported = False
    print(" GPU not supported — using CPU.\n", e)

#  Convert to NumPy
X_train_np = np.array(X_train_r)
y_train_np = np.array(y_train_r)
y_train_flag_np = np.array(y_train_c)

#  Filter only delayed trains
mask_train_delayed = y_train_flag_np == 1
X_train_delayed = X_train_np[mask_train_delayed]
y_train_delayed = y_train_np[mask_train_delayed]

print(f" Training samples (delayed only): {len(X_train_delayed)}")

# Define Regressor (GPU-ready)
reg = XGBRegressor(
    random_state=42,
    tree_method='hist',        
    device='cuda' if gpu_supported else 'cpu',
    predictor='gpu_predictor' if gpu_supported else 'auto',
    objective='reg:squarederror',
    verbosity=0
)

param_grid_r = {
    'n_estimators': [300],
    'max_depth': [3],
    'learning_rate': [0.01, 0.05],
    'min_child_weight': [1],
    'subsample': [0.8],
    'colsample_bytree': [0.8],
    'reg_lambda': [1],
    'reg_alpha': [0],
    'gamma': [0, 0.1]
}



#  Grid Search
grid_r = GridSearchCV(
    reg,
    param_grid=param_grid_r,
    cv=3,
    scoring='r2',
    n_jobs=2,         
    verbose=2
)

print("\n Starting Grid Search for Regressor (delayed trains only)...")
t0 = time()
grid_r.fit(X_train_delayed, y_train_delayed)
print(f" Grid search completed in {round(time() - t0, 2)} sec.")

#  Best model
best_reg = grid_r.best_estimator_
print("\n Best Parameters for Regressor:", grid_r.best_params_)
print(f"Best Cross-Validation R²: {grid_r.best_score_:.3f}")

#  Evaluate on delayed subset of test data
mask_test_delayed = np.array(y_test_c) == 1
X_test_delayed = np.array(X_test_r)[mask_test_delayed]
y_test_delayed = np.array(y_test_r)[mask_test_delayed]

y_pred_r = best_reg.predict(X_test_delayed)

#  Compute metrics
mae = mean_absolute_error(y_test_delayed, y_pred_r)
mse = mean_squared_error(y_test_delayed, y_pred_r)
rmse = np.sqrt(mse)
r2 = r2_score(y_test_delayed, y_pred_r)

print("\n Regressor Evaluation Metrics (Only Delayed Trains):")
print(f"MAE : {mae:.2f}")
print(f"MSE : {mse:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"R²  : {r2:.3f}")


# Final combined output
final_predictions = []
for i, flag in enumerate(y_pred_c):
    if flag == 1:
        delay = best_reg.predict(X_test_r[i].reshape(1, -1))[0]
    else:
        delay = 0
    final_predictions.append(delay)

final_df = pd.DataFrame({
    "Actual_Delayed_Flag": y_test_c.values,
    "Predicted_Delayed_Flag": y_pred_c,
    "Predicted_Delay_Minutes": np.round(final_predictions, 2)
})

print("\n Final Combined Predictions (sample):")
print(final_df.head(10))


import joblib

OUTPUT_DIR = os.path.join(BASE_DIR, "ml")

# Ensure folder exists (but don’t recreate)
if not os.path.exists(OUTPUT_DIR):
    raise FileNotFoundError(f"ML folder not found: {OUTPUT_DIR}")

CLASSIFIER_PATH = os.path.join(OUTPUT_DIR, "delay_classifier.pkl")
REGRESSOR_PATH  = os.path.join(OUTPUT_DIR, "delay_regressor.pkl")
SCALER_PATH     = os.path.join(OUTPUT_DIR, "scaler.pkl")

# Overwrite existing model files if present
for path in [CLASSIFIER_PATH, REGRESSOR_PATH, SCALER_PATH]:
    if os.path.exists(path):
        os.remove(path)

# Save models
joblib.dump(best_clf, CLASSIFIER_PATH)
joblib.dump(best_reg, REGRESSOR_PATH)
joblib.dump(scaler, SCALER_PATH)

print(f"\n Models saved successfully in: {OUTPUT_DIR}")
print(f" - Classifier: {CLASSIFIER_PATH}")
print(f" - Regressor:  {REGRESSOR_PATH}")
print(f" - Scaler:     {SCALER_PATH}")
