import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib


np.random.seed(42)

CITIES = ["Delhi", "Chandigarh", "Jaipur", "Lucknow", "Kanpur",
          "Dehradun", "Varanasi", "Agra", "Gurugram"]

ROUTE_COMPLEXITY = {
    ("Delhi", "Chandigarh"): 5,
    ("Delhi", "Jaipur"): 6,
    ("Delhi", "Lucknow"): 8,
    ("Delhi", "Kanpur"): 8,
    ("Delhi", "Dehradun"): 7,
    ("Delhi", "Varanasi"): 9,
    ("Delhi", "Agra"): 4,
    ("Delhi", "Gurugram"): 2,
    ("Chandigarh", "Jaipur"): 9,
    ("Chandigarh", "Lucknow"): 8,
    ("Chandigarh", "Kanpur"): 10,
    ("Chandigarh", "Dehradun"): 6,
    ("Chandigarh", "Varanasi"): 11,
    ("Chandigarh", "Agra"): 8,
    ("Chandigarh", "Gurugram"): 6,
    ("Jaipur", "Lucknow"): 9,
    ("Jaipur", "Kanpur"): 9,
    ("Jaipur", "Dehradun"): 10,
    ("Jaipur", "Varanasi"): 11,
    ("Jaipur", "Agra"): 5,
    ("Jaipur", "Gurugram"): 8,
    ("Lucknow", "Kanpur"): 4,
    ("Lucknow", "Dehradun"): 8,
    ("Lucknow", "Varanasi"): 6,
    ("Lucknow", "Agra"): 7,
    ("Lucknow", "Gurugram"): 9,
    ("Kanpur", "Dehradun"): 9,
    ("Kanpur", "Varanasi"): 5,
    ("Kanpur", "Agra"): 7,
    ("Kanpur", "Gurugram"): 9,
    ("Dehradun", "Varanasi"): 10,
    ("Dehradun", "Agra"): 8,
    ("Dehradun", "Gurugram"): 7,
    ("Varanasi", "Agra"): 11,
    ("Varanasi", "Gurugram"): 12,
    ("Agra", "Gurugram"): 5,
}


n_samples = 1000
quantities = np.random.randint(5, 200, n_samples)

city_pairs = np.random.choice(len(CITIES), (n_samples, 2))
origins = [CITIES[p[0]] for p in city_pairs]
destinations = [CITIES[p[1]] for p in city_pairs]

route_complexities = [
    ROUTE_COMPLEXITY.get((o, d)) or ROUTE_COMPLEXITY.get((d, o)) or 10
    for o, d in zip(origins, destinations)
]


delay = [
    1 if (q > 120 or r > 10 or (q > 80 and r > 7)) else 0
    for q, r in zip(quantities, route_complexities)
]

df = pd.DataFrame({
    "origin": origins,
    "destination": destinations,
    "quantity": quantities,
    "route_complexity": route_complexities,
    "delay": delay
})

X = df[["quantity", "route_complexity"]]
y = df["delay"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)


# Step 3: Train Model

model = LogisticRegression()
model.fit(X_train, y_train)


# Step 4: Evaluate

y_pred = model.predict(X_test)
print("Training complete")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))


# Step 5: Save Model + Scaler

joblib.dump((model, scaler), "train_model.pkl")
print("Model + Scaler saved to train_model.pkl")
