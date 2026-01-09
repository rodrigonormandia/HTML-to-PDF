"""
Tests for API rate limiting functionality.
Tests rate limit enforcement, headers, and plan-based limits.
"""
import pytest


class TestRateLimitEnforcement:
    """Tests for rate limit enforcement."""

    def test_rate_limit_exceeded_returns_429(self, client_rate_limited, valid_html):
        """Request when rate limit exceeded should return 429."""
        response = client_rate_limited.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        assert response.status_code == 429
        data = response.json()
        assert data["detail"]["error"] == "rate_limit_exceeded"

    def test_rate_limit_exceeded_includes_reset_time(self, client_rate_limited, valid_html):
        """429 response should include reset time."""
        response = client_rate_limited.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        assert "rate_limit" in data["detail"]
        assert "reset" in data["detail"]["rate_limit"]
        assert data["detail"]["rate_limit"]["reset"] > 0

    def test_rate_limit_exceeded_includes_limit_info(self, client_rate_limited, valid_html):
        """429 response should include limit information."""
        response = client_rate_limited.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        rate_limit = data["detail"]["rate_limit"]
        assert "limit" in rate_limit
        assert "remaining" in rate_limit
        assert rate_limit["remaining"] == 0


class TestRateLimitSuccess:
    """Tests for successful requests within rate limit."""

    def test_request_within_limit_succeeds(self, client, valid_html):
        """Request within rate limit should succeed."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        assert response.status_code == 200

    def test_successful_response_includes_rate_limit_info(self, client, valid_html):
        """Successful response should include rate limit info."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        # Rate limit info may be in response body for API key requests
        if "rate_limit" in data:
            assert "limit" in data["rate_limit"]
            assert "remaining" in data["rate_limit"]
            assert "reset" in data["rate_limit"]


class TestRateLimiterModule:
    """Tests for the rate limiter module itself."""

    def test_rate_limiter_constants_exist(self):
        """Rate limiter should have plan-based limits defined."""
        from backend.rate_limiter import PLAN_RATE_LIMITS

        assert "free" in PLAN_RATE_LIMITS
        assert "starter" in PLAN_RATE_LIMITS
        assert "pro" in PLAN_RATE_LIMITS
        assert "enterprise" in PLAN_RATE_LIMITS

    def test_rate_limiter_free_plan_limits(self):
        """Free plan should have lowest limits."""
        from backend.rate_limiter import PLAN_RATE_LIMITS

        free_limits = PLAN_RATE_LIMITS["free"]
        assert free_limits["per_minute"] == 10
        assert free_limits["per_hour"] == 100

    def test_rate_limiter_enterprise_plan_limits(self):
        """Enterprise plan should have highest limits."""
        from backend.rate_limiter import PLAN_RATE_LIMITS

        enterprise_limits = PLAN_RATE_LIMITS["enterprise"]
        assert enterprise_limits["per_minute"] == 120
        assert enterprise_limits["per_hour"] == 2000

    def test_rate_limits_increase_with_plan_tier(self):
        """Higher tier plans should have higher limits."""
        from backend.rate_limiter import PLAN_RATE_LIMITS

        free = PLAN_RATE_LIMITS["free"]["per_minute"]
        starter = PLAN_RATE_LIMITS["starter"]["per_minute"]
        pro = PLAN_RATE_LIMITS["pro"]["per_minute"]
        enterprise = PLAN_RATE_LIMITS["enterprise"]["per_minute"]

        assert free < starter < pro < enterprise


class TestRateLimitHeaders:
    """Tests for rate limit response headers."""

    def test_get_rate_limit_headers_function(self):
        """get_rate_limit_headers should return proper headers dict."""
        from backend.rate_limiter import get_rate_limit_headers

        rate_result = {
            "limit": 10,
            "remaining": 5,
            "reset": 30
        }

        headers = get_rate_limit_headers(rate_result)

        assert "X-RateLimit-Limit" in headers
        assert "X-RateLimit-Remaining" in headers
        assert "X-RateLimit-Reset" in headers
        assert headers["X-RateLimit-Limit"] == "10"
        assert headers["X-RateLimit-Remaining"] == "5"
        assert headers["X-RateLimit-Reset"] == "30"
