FROM python:3.10-slim

WORKDIR /app

# Install system deps (needed for DVC)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Install DVC separately (safe)
RUN pip install dvc

# Copy project files
COPY . .

# Make script executable
RUN chmod +x start.sh

# Run system
CMD ["./start.sh"]