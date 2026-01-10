"""
Webhook service for notifying external systems when PDF jobs complete.

This module provides functionality to:
- Send webhook notifications with HMAC-SHA256 signatures
- Log delivery attempts for debugging
- Handle retries and failures gracefully
"""
import hmac
import hashlib
import json
import httpx
from typing import Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def generate_webhook_signature(payload: str, secret: str) -> str:
    """
    Generate HMAC-SHA256 signature for webhook payload.

    Args:
        payload: JSON string of the webhook payload
        secret: Webhook secret key for signing

    Returns:
        Hex-encoded HMAC-SHA256 signature
    """
    return hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verify a webhook signature.

    Args:
        payload: JSON string of the webhook payload
        signature: Signature to verify (without 'sha256=' prefix)
        secret: Webhook secret key

    Returns:
        True if signature is valid, False otherwise
    """
    expected = generate_webhook_signature(payload, secret)
    return hmac.compare_digest(expected, signature)


async def get_user_webhook_configs(user_id: str) -> list:
    """
    Get active webhook configurations for a user.

    Args:
        user_id: The user's UUID

    Returns:
        List of active webhook configuration dictionaries
    """
    try:
        from .supabase_client import supabase

        result = supabase.table("webhook_configs").select("*").eq(
            "user_id", user_id
        ).eq("is_active", True).execute()

        return result.data if result.data else []
    except Exception as e:
        logger.error(f"Error fetching webhook configs for user {user_id}: {e}")
        return []


async def log_webhook_delivery(
    webhook_config_id: str,
    job_id: str,
    event_type: str,
    payload: dict,
    response_status: Optional[int] = None,
    response_body: Optional[str] = None,
    delivered_at: Optional[datetime] = None
) -> None:
    """
    Log a webhook delivery attempt.

    Args:
        webhook_config_id: UUID of the webhook configuration
        job_id: The job ID this webhook is for
        event_type: Type of event (job.completed, job.failed)
        payload: The payload that was sent
        response_status: HTTP status code of the response (if any)
        response_body: Response body (truncated if needed)
        delivered_at: When the webhook was successfully delivered
    """
    try:
        from .supabase_client import supabase

        supabase.table("webhook_deliveries").insert({
            "webhook_config_id": webhook_config_id,
            "job_id": job_id,
            "event_type": event_type,
            "payload": payload,
            "response_status": response_status,
            "response_body": response_body[:1000] if response_body else None,
            "delivered_at": delivered_at.isoformat() if delivered_at else None
        }).execute()
    except Exception as e:
        logger.error(f"Error logging webhook delivery: {e}")


async def send_webhook(
    user_id: str,
    job_id: str,
    event_type: str,
    data: Dict[str, Any]
) -> bool:
    """
    Send webhook notification for a job event to all configured endpoints.

    Args:
        user_id: User who owns the job
        job_id: The job ID
        event_type: Event type (job.completed, job.failed)
        data: Event data payload

    Returns:
        True if at least one webhook was sent successfully, False otherwise
    """
    configs = await get_user_webhook_configs(user_id)

    if not configs:
        logger.debug(f"No webhook configs for user {user_id}")
        return False

    success_count = 0

    for config in configs:
        # Check if this config subscribes to this event
        events = config.get("events", [])
        if event_type not in events:
            continue

        # Build payload
        payload = {
            "event": event_type,
            "job_id": job_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": data
        }

        payload_str = json.dumps(payload, sort_keys=True)
        signature = generate_webhook_signature(payload_str, config["secret"])

        # Send webhook
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    config["url"],
                    content=payload_str,
                    headers={
                        "Content-Type": "application/json",
                        "X-PDFLeaf-Signature": f"sha256={signature}",
                        "X-PDFLeaf-Event": event_type,
                        "X-PDFLeaf-Delivery": config["id"],
                        "User-Agent": "PDFLeaf-Webhook/1.0"
                    }
                )

                # Log successful delivery
                await log_webhook_delivery(
                    webhook_config_id=config["id"],
                    job_id=job_id,
                    event_type=event_type,
                    payload=payload,
                    response_status=response.status_code,
                    response_body=response.text,
                    delivered_at=datetime.utcnow() if response.is_success else None
                )

                if response.is_success:
                    success_count += 1
                    logger.info(f"Webhook delivered to {config['url']} for job {job_id}")
                else:
                    logger.warning(
                        f"Webhook to {config['url']} returned {response.status_code}"
                    )

        except httpx.TimeoutException:
            logger.error(f"Webhook timeout for {config['url']}")
            await log_webhook_delivery(
                webhook_config_id=config["id"],
                job_id=job_id,
                event_type=event_type,
                payload=payload,
                response_body="Timeout after 10 seconds"
            )
        except Exception as e:
            logger.error(f"Webhook error for {config['url']}: {e}")
            await log_webhook_delivery(
                webhook_config_id=config["id"],
                job_id=job_id,
                event_type=event_type,
                payload=payload,
                response_body=str(e)[:1000]
            )

    return success_count > 0


def send_webhook_sync(
    user_id: str,
    job_id: str,
    event_type: str,
    data: Dict[str, Any]
) -> bool:
    """
    Synchronous wrapper for send_webhook.
    Use this from Celery tasks or other sync contexts.

    Args:
        user_id: User who owns the job
        job_id: The job ID
        event_type: Event type (job.completed, job.failed)
        data: Event data payload

    Returns:
        True if at least one webhook was sent successfully
    """
    import asyncio

    try:
        # Try to get existing event loop
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If loop is running (e.g., in async context), create new loop
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    asyncio.run,
                    send_webhook(user_id, job_id, event_type, data)
                )
                return future.result(timeout=30)
        else:
            return loop.run_until_complete(
                send_webhook(user_id, job_id, event_type, data)
            )
    except RuntimeError:
        # No event loop, create one
        return asyncio.run(send_webhook(user_id, job_id, event_type, data))
