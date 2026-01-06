"""
Tests for HTML sanitization functions.
"""
import pytest
from backend.main import sanitize_html, ALLOWED_TAGS, ALLOWED_ATTRIBUTES


class TestSanitizeHtmlRemovesDangerousContent:
    """Tests for removing dangerous HTML content."""

    def test_removes_script_tags(self):
        """Script tags should be removed (content becomes plain text with bleach strip=True)."""
        html = "<p>Hello</p><script>alert('XSS')</script><p>World</p>"
        result = sanitize_html(html)
        assert "<script>" not in result
        assert "</script>" not in result
        assert "<p>Hello</p>" in result
        assert "<p>World</p>" in result

    def test_removes_onclick_attribute(self):
        """onclick attributes should be removed."""
        html = '<p onclick="alert(\'click\')">Click me</p>'
        result = sanitize_html(html)
        assert "onclick" not in result
        assert "<p>" in result
        assert "Click me" in result

    def test_removes_onerror_attribute(self):
        """onerror attributes should be removed."""
        html = '<img src="x" onerror="alert(\'error\')">'
        result = sanitize_html(html)
        assert "onerror" not in result

    def test_removes_javascript_href(self):
        """javascript: URLs in href should be removed."""
        html = '<a href="javascript:alert(\'xss\')">Link</a>'
        result = sanitize_html(html)
        assert "javascript:" not in result

    def test_removes_iframe_tags(self):
        """iframe tags should be removed (not in allowed list)."""
        html = '<p>Content</p><iframe src="http://evil.com"></iframe>'
        result = sanitize_html(html)
        assert "<iframe" not in result
        assert "<p>Content</p>" in result

    def test_removes_object_tags(self):
        """object tags should be removed."""
        html = '<object data="malware.swf"></object><p>Text</p>'
        result = sanitize_html(html)
        assert "<object" not in result
        assert "<p>Text</p>" in result

    def test_removes_embed_tags(self):
        """embed tags should be removed."""
        html = '<embed src="flash.swf"><p>Text</p>'
        result = sanitize_html(html)
        assert "<embed" not in result

    def test_removes_form_tags(self):
        """form tags should be removed."""
        html = '<form action="/steal"><input type="text"></form>'
        result = sanitize_html(html)
        assert "<form" not in result
        assert "<input" not in result


class TestSanitizeHtmlPreservesAllowedContent:
    """Tests for preserving allowed HTML content."""

    def test_preserves_paragraph_tags(self):
        """p tags should be preserved."""
        html = "<p>Hello World</p>"
        result = sanitize_html(html)
        assert "<p>" in result
        assert "</p>" in result
        assert "Hello World" in result

    def test_preserves_heading_tags(self):
        """Heading tags (h1-h6) should be preserved."""
        for i in range(1, 7):
            html = f"<h{i}>Heading {i}</h{i}>"
            result = sanitize_html(html)
            assert f"<h{i}>" in result
            assert f"</h{i}>" in result

    def test_preserves_div_and_span(self):
        """div and span tags should be preserved."""
        html = '<div><span>Content</span></div>'
        result = sanitize_html(html)
        assert "<div>" in result
        assert "<span>" in result

    def test_preserves_table_structure(self):
        """Table tags should be preserved."""
        html = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>'
        result = sanitize_html(html)
        assert "<table>" in result
        assert "<thead>" in result
        assert "<tbody>" in result
        assert "<tr>" in result
        assert "<th>" in result
        assert "<td>" in result

    def test_preserves_list_tags(self):
        """List tags (ul, ol, li) should be preserved."""
        html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
        result = sanitize_html(html)
        assert "<ul>" in result
        assert "<li>" in result

    def test_preserves_anchor_with_safe_href(self):
        """Anchor tags with safe href should be preserved."""
        html = '<a href="https://example.com">Link</a>'
        result = sanitize_html(html)
        assert "<a" in result
        assert "href" in result
        assert "Link" in result

    def test_preserves_img_with_safe_src(self):
        """img tags with safe src should be preserved."""
        html = '<img src="image.png" alt="Test Image">'
        result = sanitize_html(html)
        assert "<img" in result
        assert "src=" in result
        assert "alt=" in result

    def test_preserves_style_tag(self):
        """style tags should be preserved."""
        html = '<style>body { color: red; }</style>'
        result = sanitize_html(html)
        assert "<style>" in result

    def test_preserves_semantic_tags(self):
        """Semantic HTML5 tags should be preserved."""
        tags = ['header', 'footer', 'main', 'section', 'article', 'aside', 'nav']
        for tag in tags:
            html = f"<{tag}>Content</{tag}>"
            result = sanitize_html(html)
            assert f"<{tag}>" in result


class TestSanitizeHtmlPreservesAllowedAttributes:
    """Tests for preserving allowed attributes."""

    def test_preserves_class_attribute(self):
        """class attribute should be preserved."""
        html = '<div class="container">Content</div>'
        result = sanitize_html(html)
        assert 'class="container"' in result

    def test_preserves_id_attribute(self):
        """id attribute should be preserved."""
        html = '<div id="main">Content</div>'
        result = sanitize_html(html)
        assert 'id="main"' in result

    def test_preserves_style_attribute(self):
        """style attribute should be preserved."""
        html = '<p style="color: blue;">Text</p>'
        result = sanitize_html(html)
        assert "style=" in result

    def test_preserves_colspan_rowspan(self):
        """colspan and rowspan attributes should be preserved."""
        html = '<table><tr><td colspan="2" rowspan="3">Cell</td></tr></table>'
        result = sanitize_html(html)
        assert "colspan=" in result
        assert "rowspan=" in result

    def test_preserves_img_dimensions(self):
        """width and height attributes on img should be preserved."""
        html = '<img src="img.png" width="100" height="50">'
        result = sanitize_html(html)
        assert "width=" in result
        assert "height=" in result


class TestSanitizeHtmlEdgeCases:
    """Tests for edge cases in sanitization."""

    def test_handles_empty_string(self):
        """Empty string should return empty string."""
        result = sanitize_html("")
        assert result == ""

    def test_handles_plain_text(self):
        """Plain text without tags should be preserved."""
        html = "Just plain text without any HTML tags"
        result = sanitize_html(html)
        assert "Just plain text" in result

    def test_handles_nested_dangerous_content(self):
        """Nested dangerous script tags should be removed (content becomes plain text)."""
        html = '<div><p><script>alert("nested")</script>Safe content</p></div>'
        result = sanitize_html(html)
        assert "<script>" not in result
        assert "</script>" not in result
        assert "Safe content" in result

    def test_handles_malformed_html(self):
        """Malformed HTML should be handled gracefully."""
        html = '<p>Unclosed paragraph<div>Mixed</p></div>'
        result = sanitize_html(html)
        # Should not raise an exception
        assert "Unclosed paragraph" in result or "Mixed" in result

    def test_strips_dangerous_tags_completely(self):
        """Dangerous tags should be stripped, not just escaped."""
        html = '<script>evil()</script>'
        result = sanitize_html(html)
        assert "&lt;script&gt;" not in result  # Should not be escaped
        assert "<script>" not in result  # Should not be present
