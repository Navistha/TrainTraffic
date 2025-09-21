import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Set random seed for reproducibility
np.random.seed(42)

# Cities available for freight booking
CITIES = ["Delhi", "Chandigarh", "Jaipur", "Lucknow", "Kanpur",
          "Dehradun", "Varanasi", "Agra", "Gurugram"]

# Route complexity mapping
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


def generate_synthetic_data(n_samples=1000):
    """Generate synthetic freight data for training"""
    print(f"Generating {n_samples} synthetic freight records...")
    
    # Generate random quantities (in tons)
    quantities = np.random.randint(5, 200, n_samples)
    
    # Generate random city pairs
    city_pairs = np.random.choice(len(CITIES), (n_samples, 2))
    origins = [CITIES[p[0]] for p in city_pairs]
    destinations = [CITIES[p[1]] for p in city_pairs]
    
    # Calculate route complexities
    route_complexities = [
        ROUTE_COMPLEXITY.get((o, d)) or ROUTE_COMPLEXITY.get((d, o)) or 10
        for o, d in zip(origins, destinations)
    ]
    
    # Generate delay labels based on business logic
    # Higher quantity and higher route complexity increase delay probability
    delay = [
        1 if (q > 120 or r > 10 or (q > 80 and r > 7)) else 0
        for q, r in zip(quantities, route_complexities)
    ]
    
    # Create DataFrame
    df = pd.DataFrame({
        "origin": origins,
        "destination": destinations,
        "quantity": quantities,
        "route_complexity": route_complexities,
        "delay": delay
    })
    
    return df


def train_delay_prediction_model():
    """Train the freight delay prediction model"""
    print("Starting freight delay prediction model training...")
    
    # Step 1: Generate synthetic data
    df = generate_synthetic_data(1000)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Delay rate: {df['delay'].mean():.2%}")
    
    # Step 2: Prepare features and target
    X = df[["quantity", "route_complexity"]]
    y = df["delay"]
    
    print(f"Features: {list(X.columns)}")
    
    # Step 3: Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Step 4: Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")
    
    # Step 5: Train model
    model = LogisticRegression(random_state=42)
    model.fit(X_train, y_train)
    
    # Step 6: Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Performance:")
    print(f"Accuracy: {accuracy:.3f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Step 7: Save model and scaler
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "train_model.pkl")
    
    joblib.dump((model, scaler), model_path)
    print(f"\nModel saved to: {model_path}")
    
    # Step 8: Test prediction on sample data
    print("\n=== Testing Model Predictions ===")
    
    test_cases = [
        {"quantity": 50, "route_complexity": 5, "expected": "Low delay risk"},
        {"quantity": 150, "route_complexity": 8, "expected": "High delay risk"},
        {"quantity": 100, "route_complexity": 12, "expected": "High delay risk"},
        {"quantity": 30, "route_complexity": 3, "expected": "Low delay risk"},
    ]
    
    for case in test_cases:
        features = scaler.transform([[case["quantity"], case["route_complexity"]]])
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        
        print(f"Quantity: {case['quantity']} tons, Complexity: {case['route_complexity']}")
        print(f"Prediction: {'Delay' if prediction else 'No Delay'} "
              f"(Probability: {probability:.3f}) - {case['expected']}")
        print("-" * 50)
    
    return model, scaler


if __name__ == "__main__":
    print("=== Freight Delay Prediction Model Training ===")
    model, scaler = train_delay_prediction_model()
    print("Training completed successfully!")