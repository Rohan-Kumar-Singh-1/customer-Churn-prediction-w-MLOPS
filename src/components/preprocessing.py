import pandas as pd
import joblib
import os
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer


def build_preprocessor(df: pd.DataFrame):
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    numerical_cols = df.select_dtypes(exclude=['object']).columns.tolist()

    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="mean")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer([
        ("num", num_pipeline, numerical_cols),
        ("cat", cat_pipeline, categorical_cols)
    ])

    return preprocessor


def preprocess_data(df, target_col):
    df = df.copy()
    
    if 'customerID' in df.columns:
        df = df.drop('customerID', axis=1)

    # 🔥 FIX 1: Convert TotalCharges to numeric
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

    # 🔥 FIX 2: Convert target column to numeric
    if df[target_col].dtype == "object":
        df[target_col] = df[target_col].map({"Yes": 1, "No": 0})

    X = df.drop(columns=[target_col])
    y = df[target_col]

    preprocessor = build_preprocessor(X)

    X_processed = preprocessor.fit_transform(X)

    import os
    os.makedirs("models", exist_ok=True)

    import joblib
    joblib.dump(preprocessor, "models/preprocessor.pkl")

    return X_processed, y