"""
Supabase client for backend operations.
Uses service role key for admin access (bypasses RLS).
"""
import os
import hashlib
from typing import Optional, Dict
import time
from supabase import create_client, Client


def hash_api_key(api_key: str) -> str:
    """Hash API key using SHA-256 for secure storage and comparison."""
    return hashlib.sha256(api_key.encode()).hexdigest()

# Initialize Supabase client with service role key
# This key should only be used on the server side
_supabase: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create Supabase client instance."""
    global _supabase

    if _supabase is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")

        if not url or not key:
            raise ValueError(
                "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables"
            )

        _supabase = create_client(url, key)

    return _supabase


def track_conversion(
    job_id: str,
    user_id: Optional[str] = None,
    api_key_id: Optional[str] = None,
    action: str = "download",
    html_size: Optional[int] = None,
    status: str = "pending",
    source: str = "web",
    ip_address: Optional[str] = None
) -> Optional[str]:
    """
    Track a PDF conversion in the database.

    Returns the conversion ID if successful, None otherwise.
    """
    try:
        supabase = get_supabase()

        data = {
            "job_id": job_id,
            "action": action,
            "status": status,
            "source": source,
        }

        if user_id:
            data["user_id"] = user_id
        if api_key_id:
            data["api_key_id"] = api_key_id
        if html_size:
            data["html_size"] = html_size
        if ip_address:
            data["ip_address"] = ip_address

        result = supabase.table("conversions").insert(data).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
        return None

    except Exception as e:
        # Log error but don't fail the conversion
        print(f"Error tracking conversion: {e}")
        return None


def update_conversion_status(
    job_id: str,
    status: str,
    page_count: Optional[int] = None,
    file_size_bytes: Optional[int] = None,
    processing_time_ms: Optional[int] = None
) -> bool:
    """
    Update the status of a conversion.

    Returns True if successful, False otherwise.
    """
    try:
        supabase = get_supabase()

        data = {"status": status}

        if page_count is not None:
            data["page_count"] = page_count
        if file_size_bytes is not None:
            data["file_size_bytes"] = file_size_bytes
        if processing_time_ms is not None:
            data["processing_time_ms"] = processing_time_ms

        supabase.table("conversions").update(data).eq("job_id", job_id).execute()
        return True

    except Exception as e:
        print(f"Error updating conversion status: {e}")
        return False


def validate_api_key(key_hash: str) -> Optional[dict]:
    """
    Validate an API key and return user info if valid.

    Returns dict with user_id, plan, monthly_limit, etc. if valid.
    Returns None if invalid.
    """
    try:
        supabase = get_supabase()

        result = supabase.rpc("validate_api_key", {"p_key_hash": key_hash}).execute()

        if result.data and len(result.data) > 0:
            row = result.data[0]
            if row.get("is_valid"):
                return row
        return None

    except Exception as e:
        print(f"Error validating API key: {e}")
        return None


def check_user_quota(user_id: str) -> dict:
    """
    Check the usage quota for a user.

    Returns dict with monthly_limit, used_this_month, remaining, can_convert.
    """
    try:
        supabase = get_supabase()

        result = supabase.rpc("check_usage_quota", {"p_user_id": user_id}).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        # Default free tier limits
        return {
            "monthly_limit": 100,
            "used_this_month": 0,
            "remaining": 100,
            "can_convert": True
        }

    except Exception as e:
        print(f"Error checking user quota: {e}")
        # Return default limits on error
        return {
            "monthly_limit": 100,
            "used_this_month": 0,
            "remaining": 100,
            "can_convert": True
        }

# Cache for rate limits (avoids excessive database queries)
_plan_rate_limits_cache: Dict[str, Dict] = {}
_rate_limits_cache_timestamp: float = 0
RATE_LIMITS_CACHE_TTL = 300  # 5 minutes


def get_plan_rate_limits(plan: str) -> Dict[str, int]:
    """
    Get rate limits for a plan from the database.
    Uses a 5-minute cache to avoid excessive queries.

    Args:
        plan: The plan ID (free, starter, pro, enterprise)

    Returns:
        Dict with per_minute and per_hour limits
    """
    global _plan_rate_limits_cache, _rate_limits_cache_timestamp

    # Default fallback limits (free tier)
    default_limits = {"per_minute": 10, "per_hour": 100}

    # Check cache validity
    now = time.time()
    if _plan_rate_limits_cache and (now - _rate_limits_cache_timestamp) < RATE_LIMITS_CACHE_TTL:
        return _plan_rate_limits_cache.get(plan, _plan_rate_limits_cache.get("free", default_limits))

    # Fetch from database
    try:
        supabase = get_supabase()
        result = supabase.table("plans").select(
            "id, rate_limit_per_minute, rate_limit_per_hour"
        ).execute()

        # Update cache
        _plan_rate_limits_cache = {
            row["id"]: {
                "per_minute": row["rate_limit_per_minute"],
                "per_hour": row["rate_limit_per_hour"]
            }
            for row in result.data
        }
        _rate_limits_cache_timestamp = now

        return _plan_rate_limits_cache.get(plan, default_limits)

    except Exception as e:
        print(f"Error fetching rate limits: {e}")
        # Return defaults on error
        return default_limits
