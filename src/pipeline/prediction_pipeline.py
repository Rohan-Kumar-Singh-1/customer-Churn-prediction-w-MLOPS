import joblib
import pandas as pd
import tensorflow as tf

class PredictionPipeline:
    def __init__(self):
        self.model = tf.keras.models.load_model("artifacts/model.keras")
        self.preprocessor = joblib.load("artifacts/preprocessor.pkl")

    def predict(self, data: dict):
        df = pd.DataFrame([data])
        processed = self.preprocessor.transform(df)
        prediction = self.model.predict(processed)

        return float(prediction[0][0])