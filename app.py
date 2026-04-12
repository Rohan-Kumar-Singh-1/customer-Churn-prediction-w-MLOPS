import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# -------------------------------
#  Static Frontend (SAFE)
# -------------------------------
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

# -------------------------------
#  CORS
# -------------------------------
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
        raise RuntimeError(f"Model or preprocessor failed to load: {e}")

# -------------------------------
#  Thresholds
# -------------------------------
THRESHOLD = 0.6
RISK_THRESHOLD = 0.5

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
#  Root (Serve UI if exists)
# -------------------------------
@app.get("/")
def root():
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return {"message": "Churn Prediction API is running 🚀"}

# -------------------------------
#  Prediction Endpoint
# -------------------------------
@app.post("/predict")
def predict(data: ChurnInput):

    df = pd.DataFrame([data.model_dump()])

    if IS_CI:
        return {
            "probability": 0.5,
            "prediction": 0,
            "label": "Test Mode",
            "risk_level": "Low Risk"
        }

    if model is None or preprocessor is None:
        raise RuntimeError("Model or preprocessor not loaded properly")

    X = preprocessor.transform(df)

    # ✅ SAFE prediction
    prob = float(model.predict(X)[0][0])

    # ✅ NaN protection
    if np.isnan(prob):
        prob = 0.0

    prediction = int(prob > THRESHOLD)
    risk = "High Risk" if prob > RISK_THRESHOLD else "Low Risk"

    return {
        "probability": prob,
        "prediction": prediction,
        "label": "Churn" if prediction == 1 else "No Churn",
        "risk_level": risk
    }

# -------------------------------
#  React Router Support (VERY IMPORTANT)
# -------------------------------
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return {"error": "Frontend not built"}