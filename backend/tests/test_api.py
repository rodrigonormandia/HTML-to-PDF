"""
Tests for API endpoints (async flow).
"""
import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_check_returns_200(self, client):
        """Health check endpoint should return 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_returns_ok_status(self, client):
        """Health check should return status ok."""
        response = client.get("/health")
        assert response.json() == {"status": "ok"}


class TestConvertEndpoint:
    """Tests for the /api/convert endpoint (async)."""

    def test_convert_returns_job_id(self, client, valid_html):
        """Convert should return job_id and pending status."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "pending"

    def test_convert_empty_html_returns_422(self, client):
        """Convert with empty HTML should return 422 (Pydantic validation)."""
        response = client.post(
            "/api/convert",
            json={"html_content": "", "action": "preview"}
        )
        assert response.status_code == 422

    def test_convert_whitespace_html_returns_422(self, client):
        """Convert with whitespace-only HTML should return 422 (Pydantic validation)."""
        response = client.post(
            "/api/convert",
            json={"html_content": "   \n\t  ", "action": "preview"}
        )
        assert response.status_code == 422

    def test_convert_short_html_returns_422(self, client):
        """Convert with HTML shorter than 10 chars should return 422 (Pydantic validation)."""
        response = client.post(
            "/api/convert",
            json={"html_content": "<p>Hi</p>", "action": "preview"}
        )
        assert response.status_code == 422


class TestJobStatusEndpoint:
    """Tests for the /api/jobs/{job_id} endpoint."""

    def test_get_job_status_completed(self, client, valid_html):
        """Job status should be completed after processing."""
        # Submit job
        submit_response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        job_id = submit_response.json()["job_id"]

        # Check status (should be completed since mock executes sync)
        status_response = client.get(f"/api/jobs/{job_id}")
        assert status_response.status_code == 200
        data = status_response.json()
        assert data["status"] == "completed"
        assert "size" in data

    def test_get_job_status_not_found(self, client):
        """Non-existent job should return 404."""
        response = client.get("/api/jobs/non-existent-job-id")
        assert response.status_code == 404


class TestJobDownloadEndpoint:
    """Tests for the /api/jobs/{job_id}/download endpoint."""

    def test_download_completed_job_returns_pdf(self, client, valid_html):
        """Download should return PDF for completed job."""
        # Submit job
        submit_response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        job_id = submit_response.json()["job_id"]

        # Download PDF
        download_response = client.get(f"/api/jobs/{job_id}/download")
        assert download_response.status_code == 200
        assert download_response.headers["content-type"] == "application/pdf"
        assert download_response.content[:4] == b"%PDF"

    def test_download_with_preview_action(self, client, valid_html):
        """Download with action=preview should return inline disposition."""
        submit_response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        job_id = submit_response.json()["job_id"]

        download_response = client.get(f"/api/jobs/{job_id}/download?action=preview")
        assert download_response.status_code == 200
        assert "inline" in download_response.headers.get("content-disposition", "")

    def test_download_with_download_action(self, client, valid_html):
        """Download with action=download should return attachment disposition."""
        submit_response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        job_id = submit_response.json()["job_id"]

        download_response = client.get(f"/api/jobs/{job_id}/download?action=download")
        assert download_response.status_code == 200
        assert "attachment" in download_response.headers.get("content-disposition", "")

    def test_download_not_found(self, client):
        """Download for non-existent job should return 404."""
        response = client.get("/api/jobs/non-existent-job-id/download")
        assert response.status_code == 404


class TestFullAsyncFlow:
    """Tests for the complete async conversion flow."""

    def test_full_flow_preview(self, client, valid_html):
        """Test complete flow: submit -> status -> download (preview)."""
        # 1. Submit
        submit = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert submit.status_code == 200
        job_id = submit.json()["job_id"]

        # 2. Check status
        status = client.get(f"/api/jobs/{job_id}")
        assert status.status_code == 200
        assert status.json()["status"] == "completed"

        # 3. Download
        download = client.get(f"/api/jobs/{job_id}/download?action=preview")
        assert download.status_code == 200
        assert download.content[:4] == b"%PDF"

    def test_full_flow_download(self, client, valid_html):
        """Test complete flow: submit -> status -> download."""
        # 1. Submit
        submit = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        assert submit.status_code == 200
        job_id = submit.json()["job_id"]

        # 2. Check status
        status = client.get(f"/api/jobs/{job_id}")
        assert status.status_code == 200
        assert status.json()["status"] == "completed"

        # 3. Download
        download = client.get(f"/api/jobs/{job_id}/download")
        assert download.status_code == 200
        assert "attachment" in download.headers.get("content-disposition", "")


class TestPageSizes:
    """Tests for different page sizes."""

    @pytest.mark.parametrize("page_size", ["A4", "Letter", "A3", "A5", "Legal"])
    def test_convert_various_page_sizes(self, client, valid_html, page_size):
        """Convert should work with various standard page sizes."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "page_size": page_size
            }
        )
        assert submit.status_code == 200
        job_id = submit.json()["job_id"]

        download = client.get(f"/api/jobs/{job_id}/download")
        assert download.status_code == 200
        assert download.content[:4] == b"%PDF"

    def test_convert_invalid_page_size_returns_422(self, client, valid_html):
        """Convert with invalid page size should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "page_size": "InvalidSize"
            }
        )
        assert response.status_code == 422


class TestOrientation:
    """Tests for page orientation."""

    def test_convert_portrait_orientation(self, client, valid_html):
        """Convert should work with portrait orientation."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "orientation": "portrait"
            }
        )
        assert submit.status_code == 200

    def test_convert_landscape_orientation(self, client, valid_html):
        """Convert should work with landscape orientation."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "orientation": "landscape"
            }
        )
        assert submit.status_code == 200

    def test_convert_invalid_orientation_returns_422(self, client, valid_html):
        """Convert with invalid orientation should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "orientation": "diagonal"
            }
        )
        assert response.status_code == 422


class TestMargins:
    """Tests for margin configuration."""

    def test_convert_custom_margins(self, client, valid_html):
        """Convert should work with custom margins."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "margin_top": "1cm",
                "margin_bottom": "1cm",
                "margin_left": "1.5cm",
                "margin_right": "1.5cm"
            }
        )
        assert submit.status_code == 200


class TestHeaderFooterAPI:
    """Tests for header/footer API functionality."""

    def test_convert_with_header_only(self, client, valid_html):
        """Convert should work with header only."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div style='text-align:center;'>My Header</div>",
                "header_height": "2cm"
            }
        )
        assert submit.status_code == 200

    def test_convert_with_footer_only(self, client, valid_html):
        """Convert should work with footer only."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "footer_html": "<div style='text-align:center;'>My Footer</div>",
                "footer_height": "1.5cm"
            }
        )
        assert submit.status_code == 200

    def test_convert_with_header_and_footer(self, client, valid_html):
        """Convert should work with both header and footer."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div><strong>Company Name</strong></div>",
                "footer_html": "<div>Confidential Document</div>",
                "header_height": "2cm",
                "footer_height": "2cm"
            }
        )
        assert submit.status_code == 200
        job_id = submit.json()["job_id"]

        download = client.get(f"/api/jobs/{job_id}/download")
        assert download.content[:4] == b"%PDF"

    def test_convert_invalid_header_height_returns_422(self, client, valid_html):
        """Convert with invalid header height should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div>Header</div>",
                "header_height": "invalid"
            }
        )
        assert response.status_code == 422

    def test_convert_with_page_exclusions(self, client, valid_html):
        """Convert should accept page exclusion parameters."""
        submit = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div>Header</div>",
                "footer_html": "<div>Footer</div>",
                "exclude_header_pages": "1",
                "exclude_footer_pages": "1"
            }
        )
        assert submit.status_code == 200
