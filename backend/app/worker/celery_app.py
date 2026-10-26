import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "weather_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.worker.tasks", "app.worker.test_task", "app.worker.ingestion_tasks"]
)

# Configuration for Celery Beat (Scheduled Tasks)
celery_app.conf.beat_schedule = {
    "fetch-forecasts-every-6-hours": {
        "task": "app.worker.tasks.fetch_all_forecasts",
        "schedule": 21600.0, # 6 hours in seconds
    },
}
celery_app.conf.timezone = 'UTC'
