"""
Tests for API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app


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
    """Tests for the /api/convert endpoint."""

    def test_convert_preview_returns_pdf(self, client, valid_html):
        """Convert with preview action should return PDF."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "inline" in response.headers.get("content-disposition", "")
        # Verify dynamic filename format: pdfGravity_YYYYMMDD_HHMMSS.pdf
        assert "pdfGravity_" in response.headers.get("content-disposition", "")
        assert ".pdf" in response.headers.get("content-disposition", "")

    def test_convert_download_returns_pdf(self, client, valid_html):
        """Convert with download action should return PDF with attachment header."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "attachment" in response.headers.get("content-disposition", "")
        # Verify dynamic filename format: pdfGravity_YYYYMMDD_HHMMSS.pdf
        assert "pdfGravity_" in response.headers.get("content-disposition", "")
        assert ".pdf" in response.headers.get("content-disposition", "")

    def test_convert_minimal_html(self, client, minimal_html):
        """Convert should work with minimal HTML (no full structure)."""
        response = client.post(
            "/api/convert",
            json={"html_content": minimal_html, "action": "preview"}
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"

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


class TestPageSizes:
    """Tests for different page sizes."""

    @pytest.mark.parametrize("page_size", ["A4", "Letter", "A3", "A5", "Legal"])
    def test_convert_various_page_sizes(self, client, valid_html, page_size):
        """Convert should work with various standard page sizes."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "page_size": page_size
            }
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"

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
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "orientation": "portrait"
            }
        )
        assert response.status_code == 200

    def test_convert_landscape_orientation(self, client, valid_html):
        """Convert should work with landscape orientation."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "orientation": "landscape"
            }
        )
        assert response.status_code == 200

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
        response = client.post(
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
        assert response.status_code == 200

    def test_convert_margins_different_units(self, client, valid_html):
        """Convert should work with different margin units."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "margin_top": "20mm",
                "margin_bottom": "0.5in",
                "margin_left": "2cm",
                "margin_right": "2cm"
            }
        )
        assert response.status_code == 200


class TestPageNumbers:
    """Tests for page number functionality."""

    def test_convert_with_page_numbers(self, client, valid_html):
        """Convert should work with page numbers enabled."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "include_page_numbers": True
            }
        )
        assert response.status_code == 200

    def test_convert_without_page_numbers(self, client, valid_html):
        """Convert should work with page numbers disabled (default)."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "include_page_numbers": False
            }
        )
        assert response.status_code == 200


class TestPDFContent:
    """Tests for PDF content validation."""

    def test_convert_returns_valid_pdf_bytes(self, client, valid_html):
        """Convert should return valid PDF bytes (starts with %PDF)."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "preview"}
        )
        assert response.status_code == 200
        # PDF files start with %PDF
        assert response.content[:4] == b"%PDF"

    def test_convert_complex_html(self, client, complex_html):
        """Convert should handle complex HTML with tables, lists, and styles."""
        response = client.post(
            "/api/convert",
            json={"html_content": complex_html, "action": "preview"}
        )
        assert response.status_code == 200
        assert response.content[:4] == b"%PDF"


class TestFilename:
    """Tests for PDF filename generation."""

    def test_filename_has_pdfgravity_prefix(self, client, valid_html):
        """Filename should have pdfGravity_ prefix."""
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        content_disposition = response.headers.get("content-disposition", "")
        assert "pdfGravity_" in content_disposition

    def test_filename_has_timestamp_format(self, client, valid_html):
        """Filename should have timestamp in YYYYMMDD_HHMMSS format."""
        import re
        response = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        content_disposition = response.headers.get("content-disposition", "")
        # Pattern: pdfGravity_YYYYMMDD_HHMMSS.pdf
        pattern = r'pdfGravity_\d{8}_\d{6}\.pdf'
        assert re.search(pattern, content_disposition) is not None

    def test_filename_is_unique_per_request(self, client, valid_html):
        """Each request should generate a unique filename."""
        import time
        response1 = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        time.sleep(1)  # Wait 1 second to ensure different timestamp
        response2 = client.post(
            "/api/convert",
            json={"html_content": valid_html, "action": "download"}
        )
        filename1 = response1.headers.get("content-disposition", "")
        filename2 = response2.headers.get("content-disposition", "")
        # Filenames should be different due to different timestamps
        assert filename1 != filename2


class TestHeaderFooterAPI:
    """Tests for header/footer API functionality."""

    def test_convert_with_header_only(self, client, valid_html):
        """Convert should work with header only."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div style='text-align:center;'>My Header</div>",
                "header_height": "2cm"
            }
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"

    def test_convert_with_footer_only(self, client, valid_html):
        """Convert should work with footer only."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "footer_html": "<div style='text-align:center;'>My Footer</div>",
                "footer_height": "1.5cm"
            }
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"

    def test_convert_with_header_and_footer(self, client, valid_html):
        """Convert should work with both header and footer."""
        response = client.post(
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
        assert response.status_code == 200
        assert response.content[:4] == b"%PDF"

    def test_convert_header_height_mm(self, client, valid_html):
        """Convert should accept header height in mm."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div>Header</div>",
                "header_height": "25mm"
            }
        )
        assert response.status_code == 200

    def test_convert_footer_height_in(self, client, valid_html):
        """Convert should accept footer height in inches."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "footer_html": "<div>Footer</div>",
                "footer_height": "0.75in"
            }
        )
        assert response.status_code == 200

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
        response = client.post(
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
        assert response.status_code == 200

    def test_convert_invalid_page_exclusion_returns_422(self, client, valid_html):
        """Convert with invalid page exclusion should return 422."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div>Header</div>",
                "exclude_header_pages": "first"
            }
        )
        assert response.status_code == 422

    def test_convert_header_footer_with_landscape(self, client, valid_html):
        """Convert should work with header/footer in landscape mode."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "orientation": "landscape",
                "header_html": "<div>Header</div>",
                "footer_html": "<div>Footer</div>",
                "header_height": "2cm",
                "footer_height": "2cm"
            }
        )
        assert response.status_code == 200

    def test_convert_header_footer_with_page_numbers(self, client, valid_html):
        """Convert should work with header/footer and page numbers."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div>Report</div>",
                "footer_html": "<div>Page {{page}} of {{pages}}</div>",
                "include_page_numbers": True
            }
        )
        assert response.status_code == 200

    def test_convert_sanitizes_header_html(self, client, valid_html):
        """Header HTML with script tags should be sanitized."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "header_html": "<div>Header<script>alert('xss')</script></div>"
            }
        )
        # Should still succeed (script tag removed during sanitization)
        assert response.status_code == 200

    def test_convert_sanitizes_footer_html(self, client, valid_html):
        """Footer HTML with onclick should be sanitized."""
        response = client.post(
            "/api/convert",
            json={
                "html_content": valid_html,
                "action": "preview",
                "footer_html": "<div onclick='alert()'>Footer</div>"
            }
        )
        # Should still succeed (onclick removed during sanitization)
        assert response.status_code == 200
