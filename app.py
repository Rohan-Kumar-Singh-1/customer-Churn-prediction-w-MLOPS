import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------------
#  Environment-based loading
# -------------------------------
IS_CI = os.getenv("CI") == "true"

if IS_CI:
    model = None
    preprocessor = None
else:
    try:
        model = load_model("artifacts/model.keras")
        preprocessor = joblib.load("artifacts/preprocessor.pkl")
    except Exception as e:
        # Fail fast in production if model is missing
        raise RuntimeError(f"Model or preprocessor failed to load: {e}")

# -------------------------------
#  Thresholds (EXPLICIT DESIGN)
# -------------------------------
THRESHOLD = 0.6          # Final classification threshold
RISK_THRESHOLD = 0.5     # Early warning threshold

# -------------------------------
#  Input Schema
# -------------------------------
class ChurnInput(BaseModel):
    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float
    TotalCharges: float

# -------------------------------
#  Health Check
# -------------------------------
@app.get("/")
def home():
    return {"message": "Churn Prediction API is running 🚀"}

# -------------------------------
#  Prediction Endpoint
# -------------------------------
@app.post("/predict")
def predict(data: ChurnInput):

    # Convert input → DataFrame
    df = pd.DataFrame([data.model_dump()])

    # CI mode → return mock response
    if IS_CI:
        return {
            "probability": 0.5,
            "prediction": 0,
            "label": "Test Mode",
            "risk_level": "Low Risk"
        }

    # Safety check (production)
    if model is None or preprocessor is None:
        raise RuntimeError("Model or preprocessor not loaded properly")

    # Preprocess input
    X = preprocessor.transform(df)

    # Model prediction
    prob = model.predict(X)[0][0]

    # -------------------------------
    #  Decision Logic
    # -------------------------------
    prediction = int(prob > THRESHOLD)

    # Early warning system (intentional design)
    risk = "High Risk" if prob > RISK_THRESHOLD else "Low Risk"

    # -------------------------------
    #  Response
    # -------------------------------
    return {
        "probability": float(prob),
        "prediction": prediction,
        "label": "Churn" if prediction == 1 else "No Churn",
        "risk_level": risk
    }