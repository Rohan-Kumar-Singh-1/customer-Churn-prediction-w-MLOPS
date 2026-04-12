import pandas as pd
import sys
import joblib
import os

from src.utils.logger import logging
from src.utils.exception import CustomException
from src.components.preprocessing import build_preprocessor

class DataTransformation:
    def __init__(self):
        self.preprocessor_path = "artifacts/preprocessor.pkl"

    def initiate_data_transformation(self, data_path):
        logging.info("Data transformation started")

        try:
            df = pd.read_csv(data_path)

            # Drop unnecessary column
            if "customerID" in df.columns:
                df = df.drop(columns=["customerID"])

            # Convert TotalCharges
            if "TotalCharges" in df.columns:
                df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

            # Convert target
            df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

            X = df.drop(columns=["Churn"])
            y = df["Churn"]

            # Build preprocessor
            preprocessor = build_preprocessor(X)

            # Fit + transform
            X_processed = preprocessor.fit_transform(X)

            # Save preprocessor (IMPORTANT)
            os.makedirs("artifacts", exist_ok=True)
            joblib.dump(preprocessor, self.preprocessor_path)

            logging.info("Data transformation completed")

            return X_processed, y

        except Exception as e:
            raise CustomException(e, sys)