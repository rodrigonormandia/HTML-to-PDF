"""
Tests for HTML validation functions.
"""
import pytest
from backend.main import validate_html, PDFRequest
from pydantic import ValidationError


class TestValidateHtmlFunction:
    """Tests for the validate_html function."""

    def test_validate_empty_html_returns_false(self):
        """Empty HTML should be invalid."""
        is_valid, error_msg = validate_html("")
        assert is_valid is False
        assert "vazio" in error_msg.lower()

    def test_validate_none_html_returns_false(self):
        """None HTML should be invalid."""
        is_valid, error_msg = validate_html(None)
        assert is_valid is False

    def test_validate_whitespace_only_returns_false(self):
        """Whitespace-only HTML should be invalid."""
        is_valid, error_msg = validate_html("   \n\t\r   ")
        assert is_valid is False
        assert "vazio" in error_msg.lower()

    def test_validate_short_html_returns_false(self):
        """HTML shorter than 10 characters should be invalid."""
        is_valid, error_msg = validate_html("<p>Hi</p>")
        assert is_valid is False
        assert "curto" in error_msg.lower() or "10" in error_msg

    def test_validate_valid_html_returns_true(self):
        """Valid HTML should pass validation."""
        html = "<p>This is a valid paragraph with enough content.</p>"
        is_valid, error_msg = validate_html(html)
        assert is_valid is True
        assert error_msg == ""

    def test_validate_html_with_structure_returns_true(self):
        """Full HTML document should pass validation."""
        html = "<html><body><h1>Hello World</h1></body></html>"
        is_valid, error_msg = validate_html(html)
        assert is_valid is True

    def test_validate_exactly_10_chars_passes(self):
        """HTML with exactly 10 characters should pass."""
        html = "<p>Hello!</p>"  # 12 chars, should pass
        is_valid, error_msg = validate_html(html)
        assert is_valid is True


class TestPDFRequestValidation:
    """Tests for PDFRequest Pydantic model validation."""

    def test_valid_request_passes(self):
        """Valid request should pass all validations."""
        request = PDFRequest(
            html_content="<p>This is valid HTML content for testing.</p>",
            action="preview"
        )
        assert request.html_content is not None
        assert request.action == "preview"

    def test_html_min_length_enforced(self):
        """HTML content must have minimum 10 characters."""
        with pytest.raises(ValidationError) as exc_info:
            PDFRequest(html_content="<p>Hi</p>")
        assert "min_length" in str(exc_info.value).lower() or "10" in str(exc_info.value)

    def test_default_values(self):
        """Default values should be set correctly."""
        request = PDFRequest(
            html_content="<p>Test content with enough characters.</p>"
        )
        assert request.action == "preview"
        assert request.page_size == "A4"
        assert request.orientation == "portrait"
        assert request.margin_top == "2cm"
        assert request.margin_bottom == "2cm"
        assert request.margin_left == "2cm"
        assert request.margin_right == "2cm"
        assert request.include_page_numbers is False

    def test_invalid_orientation_raises_error(self):
        """Invalid orientation should raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            PDFRequest(
                html_content="<p>Test content with enough characters.</p>",
                orientation="diagonal"
            )
        assert "orientation" in str(exc_info.value).lower()

    def test_valid_orientations(self):
        """Valid orientations should be accepted."""
        for orientation in ["portrait", "landscape", "Portrait", "LANDSCAPE"]:
            request = PDFRequest(
                html_content="<p>Test content with enough characters.</p>",
                orientation=orientation
            )
            assert request.orientation in ["portrait", "landscape"]

    def test_invalid_page_size_raises_error(self):
        """Invalid page size should raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            PDFRequest(
                html_content="<p>Test content with enough characters.</p>",
                page_size="InvalidSize"
            )
        assert "page" in str(exc_info.value).lower() or "size" in str(exc_info.value).lower()

    def test_valid_page_sizes(self):
        """Valid page sizes should be accepted."""
        for size in ["A4", "Letter", "A3", "A5", "Legal", "B4", "B5"]:
            request = PDFRequest(
                html_content="<p>Test content with enough characters.</p>",
                page_size=size
            )
            assert request.page_size is not None

    def test_custom_page_size_with_units(self):
        """Custom page size with units should be accepted."""
        request = PDFRequest(
            html_content="<p>Test content with enough characters.</p>",
            page_size="210mm 297mm"
        )
        assert request.page_size == "210mm 297mm"

    def test_html_size_limit(self):
        """HTML exceeding 2MB should raise ValidationError."""
        large_html = "<p>" + "x" * (2 * 1024 * 1024 + 1) + "</p>"
        with pytest.raises(ValidationError) as exc_info:
            PDFRequest(html_content=large_html)
        assert "2mb" in str(exc_info.value).lower() or "excede" in str(exc_info.value).lower()
