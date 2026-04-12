FROM python:3.10-slim

WORKDIR /app

# ✅ Copy requirements first (for caching)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# ✅ Copy entire backend code
COPY . .

# ✅ Copy frontend build (important)
COPY frontend/dist /app/frontend/dist

# ✅ Run FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]