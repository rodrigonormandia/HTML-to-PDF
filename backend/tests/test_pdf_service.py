"""
Tests for PDF generation service.
"""
import pytest
from backend.pdf_service import generate_pdf_from_html


class TestGeneratePdfBasic:
    """Basic tests for PDF generation."""

    def test_generate_pdf_returns_bytes(self, valid_html):
        """PDF generation should return bytes."""
        result = generate_pdf_from_html(valid_html)
        assert isinstance(result, bytes)

    def test_generate_pdf_starts_with_pdf_header(self, valid_html):
        """Generated PDF should start with %PDF header."""
        result = generate_pdf_from_html(valid_html)
        assert result[:4] == b"%PDF"

    def test_generate_pdf_minimal_html(self, minimal_html):
        """PDF generation should work with minimal HTML."""
        result = generate_pdf_from_html(minimal_html)
        assert result[:4] == b"%PDF"

    def test_generate_pdf_complex_html(self, complex_html):
        """PDF generation should work with complex HTML."""
        result = generate_pdf_from_html(complex_html)
        assert result[:4] == b"%PDF"


class TestGeneratePdfPageSize:
    """Tests for page size configuration."""

    @pytest.mark.parametrize("page_size", ["A4", "Letter", "A3", "A5", "Legal"])
    def test_generate_pdf_various_sizes(self, valid_html, page_size):
        """PDF should be generated with various page sizes."""
        result = generate_pdf_from_html(valid_html, page_size=page_size)
        assert result[:4] == b"%PDF"

    def test_generate_pdf_custom_size(self, valid_html):
        """PDF should be generated with custom dimensions."""
        result = generate_pdf_from_html(valid_html, page_size="210mm 297mm")
        assert result[:4] == b"%PDF"


class TestGeneratePdfOrientation:
    """Tests for page orientation."""

    def test_generate_pdf_portrait(self, valid_html):
        """PDF should be generated in portrait orientation."""
        result = generate_pdf_from_html(valid_html, orientation="portrait")
        assert result[:4] == b"%PDF"

    def test_generate_pdf_landscape(self, valid_html):
        """PDF should be generated in landscape orientation."""
        result = generate_pdf_from_html(valid_html, orientation="landscape")
        assert result[:4] == b"%PDF"
        # Note: We can't easily verify orientation in the PDF bytes
        # but we can verify it doesn't crash


class TestGeneratePdfMargins:
    """Tests for margin configuration."""

    def test_generate_pdf_default_margins(self, valid_html):
        """PDF should be generated with default margins."""
        result = generate_pdf_from_html(valid_html)
        assert result[:4] == b"%PDF"

    def test_generate_pdf_custom_margins_cm(self, valid_html):
        """PDF should be generated with custom margins in cm."""
        result = generate_pdf_from_html(
            valid_html,
            margin_top="1cm",
            margin_bottom="1cm",
            margin_left="1.5cm",
            margin_right="1.5cm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_custom_margins_mm(self, valid_html):
        """PDF should be generated with custom margins in mm."""
        result = generate_pdf_from_html(
            valid_html,
            margin_top="10mm",
            margin_bottom="10mm",
            margin_left="15mm",
            margin_right="15mm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_custom_margins_in(self, valid_html):
        """PDF should be generated with custom margins in inches."""
        result = generate_pdf_from_html(
            valid_html,
            margin_top="0.5in",
            margin_bottom="0.5in",
            margin_left="0.75in",
            margin_right="0.75in"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_zero_margins(self, valid_html):
        """PDF should be generated with zero margins."""
        result = generate_pdf_from_html(
            valid_html,
            margin_top="0cm",
            margin_bottom="0cm",
            margin_left="0cm",
            margin_right="0cm"
        )
        assert result[:4] == b"%PDF"


class TestGeneratePdfPageNumbers:
    """Tests for page number functionality."""

    def test_generate_pdf_with_page_numbers(self, valid_html):
        """PDF should be generated with page numbers."""
        result = generate_pdf_from_html(valid_html, include_page_numbers=True)
        assert result[:4] == b"%PDF"

    def test_generate_pdf_without_page_numbers(self, valid_html):
        """PDF should be generated without page numbers."""
        result = generate_pdf_from_html(valid_html, include_page_numbers=False)
        assert result[:4] == b"%PDF"


class TestGeneratePdfHtmlWrapping:
    """Tests for HTML wrapping functionality."""

    def test_wraps_bare_html_fragment(self):
        """Bare HTML fragment should be wrapped in full document."""
        bare_html = "<p>Just a paragraph without html/body tags.</p>"
        result = generate_pdf_from_html(bare_html)
        assert result[:4] == b"%PDF"

    def test_preserves_full_html_document(self):
        """Full HTML document should be preserved."""
        full_html = """
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body><p>Content</p></body>
        </html>
        """
        result = generate_pdf_from_html(full_html)
        assert result[:4] == b"%PDF"

    def test_handles_html_with_head_only(self):
        """HTML with head but no body should work."""
        html = "<html><head><style>p{color:red}</style></head></html>"
        result = generate_pdf_from_html(html)
        assert result[:4] == b"%PDF"


class TestGeneratePdfCombinations:
    """Tests for combined configurations."""

    def test_landscape_with_custom_margins(self, valid_html):
        """Landscape orientation with custom margins should work."""
        result = generate_pdf_from_html(
            valid_html,
            orientation="landscape",
            margin_top="1cm",
            margin_bottom="1cm",
            margin_left="2cm",
            margin_right="2cm"
        )
        assert result[:4] == b"%PDF"

    def test_a3_landscape_with_page_numbers(self, valid_html):
        """A3 landscape with page numbers should work."""
        result = generate_pdf_from_html(
            valid_html,
            page_size="A3",
            orientation="landscape",
            include_page_numbers=True
        )
        assert result[:4] == b"%PDF"

    def test_letter_portrait_custom_margins_page_numbers(self, valid_html):
        """Letter size, portrait, custom margins, with page numbers should work."""
        result = generate_pdf_from_html(
            valid_html,
            page_size="Letter",
            orientation="portrait",
            margin_top="0.5in",
            margin_bottom="0.5in",
            margin_left="1in",
            margin_right="1in",
            include_page_numbers=True
        )
        assert result[:4] == b"%PDF"


class TestGeneratePdfContent:
    """Tests for PDF content quality."""

    def test_pdf_is_not_empty(self, valid_html):
        """Generated PDF should not be empty."""
        result = generate_pdf_from_html(valid_html)
        assert len(result) > 100  # PDF should have substantial content

    def test_pdf_contains_eof_marker(self, valid_html):
        """Generated PDF should contain EOF marker."""
        result = generate_pdf_from_html(valid_html)
        assert b"%%EOF" in result
