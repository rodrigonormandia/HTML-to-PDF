import redis
import json
from .config import REDIS_URL, PDF_TTL_SECONDS

_client = None


def get_redis():
    """Get or create Redis client singleton."""
    global _client
    if _client is None:
        _client = redis.from_url(REDIS_URL, decode_responses=False)
    return _client


def store_pdf(job_id: str, pdf_bytes: bytes, ttl: int = PDF_TTL_SECONDS) -> None:
    """Store PDF bytes in Redis with TTL."""
    get_redis().setex(f"pdf:{job_id}", ttl, pdf_bytes)


def get_pdf(job_id: str) -> bytes | None:
    """Retrieve PDF bytes from Redis."""
    return get_redis().get(f"pdf:{job_id}")


def set_job_status(job_id: str, status: dict, ttl: int = PDF_TTL_SECONDS) -> None:
    """Store job status in Redis with TTL."""
    get_redis().setex(f"job:{job_id}", ttl, json.dumps(status))


def get_job_status(job_id: str) -> dict | None:
    """Retrieve job status from Redis."""
    data = get_redis().get(f"job:{job_id}")
    if data is None:
        return None
    return json.loads(data)
