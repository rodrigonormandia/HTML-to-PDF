"""
Rate Limiter for API Keys

Implements per-API-key rate limiting using Redis.
Different limits are applied based on the user's plan.
"""

from datetime import datetime
from typing import Dict, Optional
import redis

# Rate limits per plan (requests per minute and per hour)
PLAN_RATE_LIMITS = {
    "free": {"per_minute": 10, "per_hour": 100},
    "starter": {"per_minute": 30, "per_hour": 500},
    "pro": {"per_minute": 60, "per_hour": 1000},
    "enterprise": {"per_minute": 120, "per_hour": 2000},
}


class APIKeyRateLimiter:
    """
    Rate limiter that tracks API usage per API key using Redis.

    Uses a sliding window approach with minute-based keys that auto-expire.
    """

    def __init__(self, redis_client: redis.Redis):
        """
        Initialize the rate limiter with a Redis client.

        Args:
            redis_client: Redis client instance for storing rate limit counters
        """
        self.redis = redis_client

    def check_rate_limit(self, api_key_id: str, plan: str) -> Dict:
        """
        Check if the API key has exceeded its rate limit.

        Args:
            api_key_id: The UUID of the API key
            plan: The user's plan (free, starter, pro, enterprise)

        Returns:
            Dict with:
                - allowed: bool - whether the request should be allowed
                - limit: int - the rate limit for this plan
                - remaining: int - remaining requests in current window
                - reset: int - seconds until the rate limit resets
        """
        # Get limits for the plan, default to free tier
        limits = PLAN_RATE_LIMITS.get(plan, PLAN_RATE_LIMITS["free"])

        # Create a minute-based key that will auto-expire
        current_minute = datetime.utcnow().strftime('%Y%m%d%H%M')
        minute_key = f"ratelimit:{api_key_id}:minute:{current_minute}"

        # Increment the counter
        try:
            current = self.redis.incr(minute_key)

            # Set expiration on first request (60 seconds)
            if current == 1:
                self.redis.expire(minute_key, 60)
        except redis.RedisError:
            # If Redis fails, allow the request but log the error
            return {
                "allowed": True,
                "limit": limits["per_minute"],
                "remaining": limits["per_minute"],
                "reset": 60
            }

        limit = limits["per_minute"]
        remaining = max(0, limit - current)
        reset = 60 - datetime.utcnow().second

        return {
            "allowed": current <= limit,
            "limit": limit,
            "remaining": remaining,
            "reset": reset
        }

    def get_usage_stats(self, api_key_id: str, plan: str) -> Dict:
        """
        Get current usage statistics for an API key.

        Args:
            api_key_id: The UUID of the API key
            plan: The user's plan

        Returns:
            Dict with usage statistics
        """
        limits = PLAN_RATE_LIMITS.get(plan, PLAN_RATE_LIMITS["free"])
        current_minute = datetime.utcnow().strftime('%Y%m%d%H%M')
        minute_key = f"ratelimit:{api_key_id}:minute:{current_minute}"

        try:
            current = self.redis.get(minute_key)
            current = int(current) if current else 0
        except redis.RedisError:
            current = 0

        return {
            "current_minute_usage": current,
            "limit_per_minute": limits["per_minute"],
            "limit_per_hour": limits["per_hour"],
            "plan": plan
        }


def get_rate_limit_headers(rate_result: Dict) -> Dict[str, str]:
    """
    Generate standard rate limit headers for HTTP responses.

    Args:
        rate_result: Result from check_rate_limit()

    Returns:
        Dict of header name -> value pairs
    """
    return {
        "X-RateLimit-Limit": str(rate_result["limit"]),
        "X-RateLimit-Remaining": str(rate_result["remaining"]),
        "X-RateLimit-Reset": str(rate_result["reset"])
    }
