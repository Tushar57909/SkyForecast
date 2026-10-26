from app.worker.celery_app import celery_app

@celery_app.task
def foundation_test_task():
    """Trivial test task to verify Celery worker functionality."""
    return {"status": "success", "message": "Celery foundation is running."}
