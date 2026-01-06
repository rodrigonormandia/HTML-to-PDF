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


class TestGeneratePdfHeaderFooter:
    """Tests for header/footer functionality."""

    def test_generate_pdf_with_header_only(self, valid_html):
        """PDF should be generated with header only."""
        result = generate_pdf_from_html(
            valid_html,
            header_html="<div style='text-align:center;'>My Header</div>",
            header_height="2cm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_with_footer_only(self, valid_html):
        """PDF should be generated with footer only."""
        result = generate_pdf_from_html(
            valid_html,
            footer_html="<div style='text-align:center;'>My Footer</div>",
            footer_height="2cm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_with_header_and_footer(self, valid_html):
        """PDF should be generated with both header and footer."""
        result = generate_pdf_from_html(
            valid_html,
            header_html="<div><strong>Company Name</strong></div>",
            footer_html="<div>Confidential Document</div>",
            header_height="2cm",
            footer_height="2cm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_with_complex_header_html(self, valid_html):
        """PDF should handle complex header HTML with styles."""
        header = """
        <div style="display:flex; justify-content:space-between; width:100%;">
            <span style="font-weight:bold;">Left Text</span>
            <span>Center</span>
            <span style="font-style:italic;">Right Text</span>
        </div>
        """
        result = generate_pdf_from_html(
            valid_html,
            header_html=header,
            header_height="3cm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_header_with_different_heights(self, valid_html):
        """PDF should handle different header/footer heights."""
        result = generate_pdf_from_html(
            valid_html,
            header_html="<div>Header</div>",
            footer_html="<div>Footer</div>",
            header_height="3cm",
            footer_height="1.5cm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_header_with_mm_unit(self, valid_html):
        """PDF should handle header height in mm."""
        result = generate_pdf_from_html(
            valid_html,
            header_html="<div>Header</div>",
            header_height="25mm"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_header_with_in_unit(self, valid_html):
        """PDF should handle header height in inches."""
        result = generate_pdf_from_html(
            valid_html,
            footer_html="<div>Footer</div>",
            footer_height="0.75in"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_with_page_numbers_in_footer(self, valid_html):
        """PDF should integrate page numbers with custom footer."""
        result = generate_pdf_from_html(
            valid_html,
            footer_html="<div>Page {{page}} of {{pages}}</div>",
            footer_height="2cm",
            include_page_numbers=True
        )
        assert result[:4] == b"%PDF"


class TestGeneratePdfPageExclusions:
    """Tests for page exclusion functionality."""

    def test_generate_pdf_exclude_header_first_page(self, complex_html):
        """PDF should handle header exclusion for first page."""
        result = generate_pdf_from_html(
            complex_html,
            header_html="<div>Header</div>",
            header_height="2cm",
            exclude_header_pages="1"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_exclude_footer_first_page(self, complex_html):
        """PDF should handle footer exclusion for first page."""
        result = generate_pdf_from_html(
            complex_html,
            footer_html="<div>Footer</div>",
            footer_height="2cm",
            exclude_footer_pages="1"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_exclude_multiple_pages(self, complex_html):
        """PDF should handle exclusion for multiple pages."""
        result = generate_pdf_from_html(
            complex_html,
            header_html="<div>Header</div>",
            footer_html="<div>Footer</div>",
            header_height="2cm",
            footer_height="2cm",
            exclude_header_pages="1, 3, 5",
            exclude_footer_pages="2, 4"
        )
        assert result[:4] == b"%PDF"

    def test_generate_pdf_exclusion_without_header_footer(self, valid_html):
        """Exclusion should be ignored if no header/footer is defined."""
        result = generate_pdf_from_html(
            valid_html,
            exclude_header_pages="1"
        )
        assert result[:4] == b"%PDF"


class TestGeneratePdfHeaderFooterCombinations:
    """Tests for combined header/footer with other configurations."""

    def test_landscape_with_header_footer(self, valid_html):
        """Landscape orientation with header/footer should work."""
        result = generate_pdf_from_html(
            valid_html,
            orientation="landscape",
            header_html="<div>Header</div>",
            footer_html="<div>Footer</div>",
            header_height="2cm",
            footer_height="2cm"
        )
        assert result[:4] == b"%PDF"

    def test_a3_with_header_footer_and_page_numbers(self, valid_html):
        """A3 size with header/footer and page numbers should work."""
        result = generate_pdf_from_html(
            valid_html,
            page_size="A3",
            header_html="<div>Report Header</div>",
            footer_html="<div>Page {{page}}</div>",
            header_height="2cm",
            footer_height="1.5cm",
            include_page_numbers=True
        )
        assert result[:4] == b"%PDF"

    def test_letter_landscape_custom_margins_header_footer(self, valid_html):
        """Letter size landscape with custom margins and header/footer."""
        result = generate_pdf_from_html(
            valid_html,
            page_size="Letter",
            orientation="landscape",
            margin_left="1in",
            margin_right="1in",
            header_html="<div style='text-align:right;'>Company Logo</div>",
            footer_html="<div style='text-align:center;'>Confidential</div>",
            header_height="1in",
            footer_height="0.5in"
        )
        assert result[:4] == b"%PDF"
