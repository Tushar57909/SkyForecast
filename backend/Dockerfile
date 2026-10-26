FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./backend_requirements.txt
COPY ml/requirements.txt ./ml_requirements.txt
RUN pip install --no-cache-dir -r backend_requirements.txt -r ml_requirements.txt

# Copy source code
COPY backend/ ./backend/
COPY ml/ ./ml/
WORKDIR /app/backend

# Expose FastAPI port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
