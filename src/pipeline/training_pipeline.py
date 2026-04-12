from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer

from src.utils.logger import logging

class TrainingPipeline:
    def start(self):
        logging.info("Pipeline started")

        ingestion = DataIngestion()
        data_path = ingestion.initiate_data_ingestion()

        transformation = DataTransformation()
        X, y = transformation.initiate_data_transformation(data_path)

        trainer = ModelTrainer()
        trainer.initiate_model_training(X, y)

        logging.info("Pipeline completed")