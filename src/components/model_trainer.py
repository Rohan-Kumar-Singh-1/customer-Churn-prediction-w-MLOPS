import sys
import os

# Disable GPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import tensorflow as tf
import mlflow
import mlflow.keras

from sklearn.metrics import accuracy_score

from src.utils.logger import logging
from src.utils.exception import CustomException
from src.components.model import build_model


class ModelTrainer:
    def __init__(self):
        self.model_path = "artifacts/model.keras"

    def initiate_model_training(self, X_train, X_test, y_train, y_test):
        logging.info("Model training started")

        try:
            # ✅ Start MLflow experiment
            mlflow.set_experiment("churn-mlops-experiment")

            with mlflow.start_run():

                logging.info("MLflow run started")

                # Log parameters
                mlflow.log_param("epochs", 10)
                mlflow.log_param("batch_size", 32)

                # ✅ Build model using TRAIN data
                model = build_model(X_train.shape[1])

                # Train model
                model.fit(
                    X_train,
                    y_train,
                    validation_data=(X_test, y_test),
                    epochs=10,
                    batch_size=32,
                    verbose=1
                )

                # Predictions
                y_pred = (model.predict(X_test) > 0.5).astype("int32")
                acc = accuracy_score(y_test, y_pred)

                # Log metrics
                mlflow.log_metric("accuracy", acc)

                logging.info(f"Test Accuracy: {acc}")

                # Log model
                mlflow.keras.log_model(model, "model")

                # Save locally
                os.makedirs("artifacts", exist_ok=True)
                model.save(self.model_path)

                logging.info("Model training completed")

        except Exception as e:
            raise CustomException(e, sys)