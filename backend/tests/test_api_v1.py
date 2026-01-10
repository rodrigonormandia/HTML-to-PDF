"""
Tests for API v1 versioned endpoints.
Ensures that /api/v1/* endpoints work identically to /api/* endpoints.
"""
import pytest


class TestAPIVersionHeader:
    """Tests for API version header in responses."""

    def test_response_includes_version_header(self, client):
        """All API responses should include X-API-Version header."""
        response = client.get("/health")
        assert "X-API-Version" in response.headers
        assert response.headers["X-API-Version"] == "1.0"

    def test_convert_endpoint_includes_version_header(self, client, valid_html):
        """Convert endpoint should include version header."""
        response = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert "X-API-Version" in response.headers
        assert response.headers["X-API-Version"] == "1.0"


class TestV1ConvertEndpoint:
    """Tests for the /api/v1/convert endpoint."""

    def test_v1_convert_returns_job_id(self, client, valid_html):
        """V1 convert should return job_id and pending status."""
        response = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "pending"

    def test_v1_convert_same_as_legacy(self, client, valid_html):
        """V1 convert should behave identically to legacy /api/convert."""
        # Test v1 endpoint
        v1_response = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "preview"}
        )

        # Test legacy endpoint
        legacy_response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )

        assert v1_response.status_code == legacy_response.status_code

        v1_data = v1_response.json()
        legacy_data = legacy_response.json()

        # Both should have same structure
        assert "job_id" in v1_data
        assert "job_id" in legacy_data
        assert v1_data["status"] == legacy_data["status"]

    def test_v1_convert_empty_html_returns_422(self, client):
        """V1 convert with empty HTML should return 422."""
        response = client.post(
            "/api/v1/convert",
            json={"html_content": "", "action": "preview"}
        )
        assert response.status_code == 422


class TestV1JobStatusEndpoint:
    """Tests for the /api/v1/jobs/{job_id} endpoint."""

    def test_v1_get_job_status_completed(self, client, valid_html):
        """V1 job status should return completed after processing."""
        # Submit job via v1
        submit_response = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        job_id = submit_response.json()["job_id"]

        # Check status via v1
        status_response = client.get(f"/api/v1/jobs/{job_id}")
        assert status_response.status_code == 200
        data = status_response.json()
        assert data["status"] == "completed"
        assert "size" in data

    def test_v1_job_status_not_found(self, client):
        """V1 job status for non-existent job should return 404."""
        response = client.get("/api/v1/jobs/non-existent-job-id")
        assert response.status_code == 404


class TestV1JobDownloadEndpoint:
    """Tests for the /api/v1/jobs/{job_id}/download endpoint."""

    def test_v1_download_completed_job_returns_pdf(self, client, valid_html):
        """V1 download should return PDF for completed job."""
        # Submit job via v1
        submit_response = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        job_id = submit_response.json()["job_id"]

        # Download via v1
        download_response = client.get(f"/api/v1/jobs/{job_id}/download")
        assert download_response.status_code == 200
        assert download_response.headers["content-type"] == "application/pdf"
        assert download_response.content[:4] == b"%PDF"

    def test_v1_download_not_found(self, client):
        """V1 download for non-existent job should return 404."""
        response = client.get("/api/v1/jobs/non-existent-job-id/download")
        assert response.status_code == 404


class TestV1FullFlow:
    """Tests for complete v1 API flow."""

    def test_v1_full_flow_preview(self, client, valid_html):
        """Test complete v1 flow: submit -> status -> download (preview)."""
        # 1. Submit via v1
        submit = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert submit.status_code == 200
        job_id = submit.json()["job_id"]

        # 2. Check status via v1
        status = client.get(f"/api/v1/jobs/{job_id}")
        assert status.status_code == 200
        assert status.json()["status"] == "completed"

        # 3. Download via v1
        download = client.get(f"/api/v1/jobs/{job_id}/download?action=preview")
        assert download.status_code == 200
        assert download.content[:4] == b"%PDF"

    def test_cross_version_compatibility(self, client, valid_html):
        """Jobs created via v1 should be accessible via legacy endpoints."""
        # Submit via v1
        submit = client.post(
            "/api/v1/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        job_id = submit.json()["job_id"]

        # Access via legacy endpoints
        status = client.get(f"/api/jobs/{job_id}")
        assert status.status_code == 200

        download = client.get(f"/api/jobs/{job_id}/download")
        assert download.status_code == 200
        assert download.content[:4] == b"%PDF"
