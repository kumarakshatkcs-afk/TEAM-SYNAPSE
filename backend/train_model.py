import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

# Ensure model directory exists
if not os.path.exists('model'):
    os.makedirs('model')

print("Generating synthetic transaction data...")
# Generate synthetic data
# Features: amount, old_balance_org, new_balance_org, old_balance_dest, new_balance_dest
# We will simulate some patterns.
n_samples = 1000
rng = np.random.RandomState(42)

# Normal transactions
X_normal = 0.3 * rng.randn(n_samples, 5) + 2
# Fraudulent transactions (outliers)
X_outliers = rng.uniform(low=-4, high=4, size=(50, 5))

X = np.r_[X_normal, X_outliers]

print("Training Isolation Forest model...")
# Train Isolation Forest
clf = IsolationForest(max_samples=100, random_state=rng, contamination=0.05)
clf.fit(X)

# Save the model
model_path = 'model/fraud_model.pkl'
joblib.dump(clf, model_path)
print(f"Model saved to {model_path}")

# Test prediction
test_data = [[2.1, 2.0, 2.2, 2.1, 2.3]] # Should be normal
score = clf.decision_function(test_data)
prediction = clf.predict(test_data)

print(f"Test Prediction (1=normal, -1=fraud): {prediction[0]}")
print(f"Anomaly Score: {score[0]}")
