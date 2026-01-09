"""
Tests for API error scenarios.
Tests quota exceeded, job errors, and various failure modes.
"""
import pytest


class TestQuotaExceeded:
    """Tests for quota exceeded scenarios."""

    def test_quota_exceeded_returns_429(self, client_quota_exceeded, valid_html):
        """Request when quota exceeded should return 429."""
        response = client_quota_exceeded.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        assert response.status_code == 429
        data = response.json()
        assert data["detail"]["error"] == "quota_exceeded"

    def test_quota_exceeded_includes_usage_info(self, client_quota_exceeded, valid_html):
        """429 quota response should include usage information."""
        response = client_quota_exceeded.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        assert "quota" in data["detail"]
        quota = data["detail"]["quota"]
        assert "used" in quota
        assert "limit" in quota
        assert "remaining" in quota
        assert quota["remaining"] == 0


class TestJobNotFound:
    """Tests for job not found scenarios."""

    def test_get_nonexistent_job_returns_404(self, client):
        """Getting status of non-existent job should return 404."""
        response = client.get("/api/jobs/nonexistent-job-id")
        assert response.status_code == 404

    def test_download_nonexistent_job_returns_404(self, client):
        """Downloading non-existent job should return 404."""
        response = client.get("/api/jobs/nonexistent-job-id/download")
        assert response.status_code == 404


class TestInputValidationErrors:
    """Tests for input validation error scenarios."""

    def test_empty_html_returns_422(self, client):
        """Empty HTML content should return 422."""
        response = client.post(
            "/api/convert",
            json={"html_content": ""}
        )
        assert response.status_code == 422

    def test_whitespace_only_html_returns_422(self, client):
        """Whitespace-only HTML should return 422."""
        response = client.post(
            "/api/convert",
            json={"html_content": "   \n\t  "}
        )
        assert response.status_code == 422

    def test_too_short_html_returns_422(self, client):
        """HTML shorter than 10 characters should return 422."""
        response = client.post(
            "/api/convert",
            json={"html_content": "<p>Hi</p>"}  # 9 chars
        )
        assert response.status_code == 422

    def test_missing_html_content_returns_422(self, client):
        """Request without html_content should return 422."""
        response = client.post(
            "/api/convert",
            json={"action": "preview"}
        )
        assert response.status_code == 422

    def test_invalid_orientation_returns_422(self, client, valid_html):
        """Invalid orientation value should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "orientation": "diagonal"
            }
        )
        assert response.status_code == 422

    def test_invalid_page_size_returns_422(self, client, valid_html):
        """Invalid page size should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "page_size": "INVALID"
            }
        )
        assert response.status_code == 422

    def test_invalid_header_height_returns_422(self, client, valid_html):
        """Header height without unit should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "header_html": "<div>Header</div>",
                "header_height": "50"  # Missing unit
            }
        )
        assert response.status_code == 422


class TestHealthEndpoint:
    """Tests for health check endpoint (always available)."""

    def test_health_check_returns_200(self, client):
        """Health check should always return 200."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_returns_ok_status(self, client):
        """Health check should return ok status."""
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"


class TestErrorResponseFormat:
    """Tests for consistent error response format."""

    def test_401_error_has_detail_with_error_and_message(self, client_no_auth, valid_html):
        """401 errors should have consistent format."""
        response = client_no_auth.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
        assert "message" in data["detail"]

    def test_429_rate_limit_error_format(self, client_rate_limited, valid_html):
        """429 rate limit errors should have consistent format."""
        response = client_rate_limited.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
        assert "message" in data["detail"]
        assert "rate_limit" in data["detail"]

    def test_429_quota_error_format(self, client_quota_exceeded, valid_html):
        """429 quota errors should have consistent format."""
        response = client_quota_exceeded.post(
            "/api/convert",
            json={"html_content": valid_html}
        )
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
        assert "message" in data["detail"]
        assert "quota" in data["detail"]
