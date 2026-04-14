from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer

from src.utils.logger import logging


class TrainingPipeline:
    def start(self):
        logging.info("Pipeline started")

        try:
            # -------------------------------
            # Data Ingestion
            # -------------------------------
            ingestion = DataIngestion()
            data_path = ingestion.initiate_data_ingestion()

            # -------------------------------
            # Data Transformation (NOW RETURNS SPLIT DATA)
            # -------------------------------
            transformation = DataTransformation()
            X_train, X_test, y_train, y_test = transformation.initiate_data_transformation(data_path)

            # -------------------------------
            # Model Training
            # -------------------------------
            trainer = ModelTrainer()
            trainer.initiate_model_training(
                X_train, X_test, y_train, y_test
            )

            logging.info("Pipeline completed successfully")

        except Exception as e:
            logging.error("Pipeline failed")
            raise e