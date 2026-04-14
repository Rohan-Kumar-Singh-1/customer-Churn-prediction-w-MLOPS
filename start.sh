#!/bin/bash

echo "Starting system..."

# -------------------------------
# Step 1: Pull data using DVC
# -------------------------------
echo "Pulling data with DVC..."
dvc pull

# -------------------------------
# Step 2: Train model if not exists
# -------------------------------
if [ ! -f "artifacts/model.keras" ]; then
    echo "Training model..."
    python main.py
else
    echo "Model already exists, skipping training"
fi

# -------------------------------
# Step 3: Start API
# -------------------------------
echo "Starting FastAPI..."
uvicorn app:app --host 0.0.0.0 --port 8000