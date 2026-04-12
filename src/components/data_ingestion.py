import pandas as pd
import os
import sys
from src.utils.logger import logging
from src.utils.exception import CustomException

class DataIngestion:
    def __init__(self):
        self.raw_data_path = "data/churn.csv"

    def initiate_data_ingestion(self):
        logging.info("Starting data ingestion")

        try:
            df = pd.read_csv("data/churn.csv")

            os.makedirs("artifacts", exist_ok=True)
            df.to_csv(self.raw_data_path, index=False)

            logging.info("Data ingestion completed")

            return self.raw_data_path

        except Exception as e:
            raise CustomException(e, sys)