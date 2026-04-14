import pandas as pd
import sys
import joblib
import os

from sklearn.model_selection import train_test_split

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

            # Split features and target
            X = df.drop(columns=["Churn"])
            y = df["Churn"]

            # ✅ STEP 1: Split FIRST (CRITICAL FIX)
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # ✅ STEP 2: Build preprocessor on TRAIN data
            preprocessor = build_preprocessor(X_train)

            # ✅ STEP 3: Fit ONLY on train
            X_train_processed = preprocessor.fit_transform(X_train)

            # ✅ STEP 4: Transform test
            X_test_processed = preprocessor.transform(X_test)

            # Save preprocessor
            os.makedirs("artifacts", exist_ok=True)
            joblib.dump(preprocessor, self.preprocessor_path)

            logging.info("Data transformation completed")

            # ✅ RETURN 4 VALUES (IMPORTANT)
            return X_train_processed, X_test_processed, y_train, y_test

        except Exception as e:
            raise CustomException(e, sys)