from celery import Celery
from .config import REDIS_URL

celery_app = Celery(
    "pdf_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_track_started=True,
    task_time_limit=120,  # 2 min max per task
    worker_prefetch_multiplier=1,  # Don't prefetch more tasks than workers
)

# Auto-discover tasks
celery_app.autodiscover_tasks(["backend"])
