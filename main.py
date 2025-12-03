from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import base64
import json

app = FastAPI(title="Sentinel Ledger AI Backend")

# Load Model
MODEL_PATH = 'model/fraud_model.pkl'
if not os.path.exists(MODEL_PATH):
    raise RuntimeError("Model not found. Please run train_model.py first.")

model = joblib.load(MODEL_PATH)

# Key Management (For demo purposes, we generate a new key on startup or load from file)
# In production, use a secure key management system.
KEY_PATH = 'private_key.pem'

if os.path.exists(KEY_PATH):
    with open(KEY_PATH, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )
else:
    private_key = ed25519.Ed25519PrivateKey.generate()
    # Save private key
    with open(KEY_PATH, "wb") as key_file:
        key_file.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            )
        )

public_key = private_key.public_key()

# Export public key for the Oracle/Smart Contract to verify
public_bytes = public_key.public_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PublicFormat.Raw
)
print(f"Server Public Key (Base64): {base64.b64encode(public_bytes).decode('utf-8')}")


class Transaction(BaseModel):
    transaction_id: str
    amount: float
    sender: str
    receiver: str
    # Add other features used in training if necessary, for now we map available fields to model features
    # For the dummy model we need 5 features. Let's assume we derive them or receive them.
    # To keep it simple for the demo, we'll take raw features or just use 'amount' and some dummy values.
    # Let's add explicit features for the model to the request for this demo.
    features: list[float] # Expecting 5 floats

class PredictionResponse(BaseModel):
    transaction_id: str
    fraud_score: float
    is_fraud: bool
    signature: str

@app.post("/predict_transaction", response_model=PredictionResponse)
async def predict_transaction(tx: Transaction):
    if len(tx.features) != 5:
        raise HTTPException(status_code=400, detail="Model expects 5 features.")

    # Predict
    features_np = np.array([tx.features])
    # decision_function returns anomaly score. Lower is more anomalous.
    # predict returns -1 for outlier (fraud), 1 for inlier (normal).
    
    score = model.decision_function(features_np)[0]
    prediction = model.predict(features_np)[0]
    
    is_fraud = prediction == -1
    
    # Normalize score to 0-1 for the contract (just for demo logic)
    # Isolation forest scores are roughly -0.5 to 0.5.
    # Let's map it: if score < 0 it's likely fraud.
    # We'll send the raw score or a normalized probability.
    # Let's send a "risk score" where 1.0 is high risk.
    # Simple inversion for demo:
    risk_score = 0.0
    if score < 0:
        risk_score = min(abs(score) * 2, 1.0) # Cap at 1.0
    
    # Sign the result
    # Message to sign: transaction_id + risk_score (as string) + is_fraud (as string)
    message = f"{tx.transaction_id}:{risk_score}:{str(is_fraud).lower()}".encode('utf-8')
    signature = private_key.sign(message)
    signature_b64 = base64.b64encode(signature).decode('utf-8')

    return {
        "transaction_id": tx.transaction_id,
        "fraud_score": risk_score,
        "is_fraud": is_fraud,
        "signature": signature_b64
    }

@app.get("/")
def read_root():
    return {"status": "AI Backend Running"}
