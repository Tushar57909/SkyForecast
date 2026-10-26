FROM python:3.10-slim

WORKDIR /app

# Install ML dependencies needed for the prompt
RUN pip install --no-cache-dir numpy==1.26.4 pandas==2.2.1 scikit-learn==1.4.1.post1 xgboost==2.0.3

# We will bind mount the backend directory to /app
# We will bind mount the data directory to /data
# so that the container has access to backend scripts and CSV data.

# Set PYTHONPATH to /app so that ml.training.train_weight_models can be run
ENV PYTHONPATH=/app
