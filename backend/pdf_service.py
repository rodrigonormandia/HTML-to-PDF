try:
    from weasyprint import HTML, CSS
except OSError:
    HTML = None
    CSS = None
    print("WARNING: WeasyPrint dependencies not found. PDF generation will fail unless GTK3 is installed.")


def _build_page_css(
    page_size: str,
    orientation: str,
    margin_top: str,
    margin_bottom: str,
    margin_left: str,
    margin_right: str,
    include_page_numbers: bool,
    header_html: str | None,
    footer_html: str | None,
    header_height: str,
    footer_height: str
) -> str:
    """
    Builds the @page CSS rules for PDF generation.

    Uses WeasyPrint running elements for header/footer support:
    - Running elements allow HTML content in page margin boxes
    - CSS 'position: running(name)' removes element from flow and assigns to running element
    - CSS 'content: element(name)' places running element in margin box
    """
    # Base size value with orientation
    size_value = f"{page_size} landscape" if orientation == "landscape" else page_size

    # Adjust margins if header/footer present
    # Header/footer content goes in margin-top/margin-bottom areas
    effective_margin_top = margin_top
    effective_margin_bottom = margin_bottom

    if header_html:
        effective_margin_top = header_height
    if footer_html:
        effective_margin_bottom = footer_height

    # Base @page rules
    page_css = f"""
        @page {{
            size: {size_value} !important;
            margin-top: {effective_margin_top} !important;
            margin-bottom: {effective_margin_bottom} !important;
            margin-left: {margin_left} !important;
            margin-right: {margin_right} !important;
        }}
    """

    # Add running element rules for header
    if header_html:
        page_css += """
        .pdf-running-header {
            position: running(pdfHeader);
        }
        @page {
            @top-center {
                content: element(pdfHeader);
            }
        }
        """

    # Add running element rules for footer
    if footer_html:
        page_css += """
        .pdf-running-footer {
            position: running(pdfFooter);
        }
        @page {
            @bottom-center {
                content: element(pdfFooter);
            }
        }
        """

    # Page numbers (only if no custom footer, otherwise integrate into footer)
    if include_page_numbers and not footer_html:
        page_css += """
        @page {
            @bottom-center {
                content: "Página " counter(page) " de " counter(pages);
                font-size: 10pt;
                color: #666;
            }
        }
        """

    # Page break helper classes
    page_css += """
        .page-break {
            page-break-after: always;
            break-after: page;
        }
        .page-break-before {
            page-break-before: always;
            break-before: page;
        }
        .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
        }
    """

    return page_css


def _inject_running_elements(
    html: str,
    header_html: str | None,
    footer_html: str | None,
    include_page_numbers: bool
) -> str:
    """
    Injects header/footer HTML as running elements into the document.

    Running elements must be placed at the start of <body> content.
    They are removed from normal flow by CSS 'position: running()'.
    """
    running_elements = ""

    if header_html:
        running_elements += f"""
        <div class="pdf-running-header" style="width: 100%;">
            {header_html}
        </div>
        """

    if footer_html:
        # If page numbers requested, inject counter into footer
        footer_content = footer_html
        if include_page_numbers:
            # Replace placeholder if present, otherwise append
            if "{{page}}" in footer_content:
                footer_content = footer_content.replace("{{page}}", '<span class="page-num"></span>')
            if "{{pages}}" in footer_content:
                footer_content = footer_content.replace("{{pages}}", '<span class="page-total"></span>')

        running_elements += f"""
        <div class="pdf-running-footer" style="width: 100%;">
            {footer_content}
        </div>
        """

    if not running_elements:
        return html

    # Add CSS for page counter spans if needed
    if include_page_numbers and footer_html:
        counter_css = """
        <style>
            .page-num::before { content: counter(page); }
            .page-total::before { content: counter(pages); }
        </style>
        """
        running_elements = counter_css + running_elements

    # Inject after <body> tag
    if "<body" in html.lower():
        # Find the end of the body tag (could have attributes)
        import re
        body_match = re.search(r'<body[^>]*>', html, re.IGNORECASE)
        if body_match:
            insert_pos = body_match.end()
            html = html[:insert_pos] + running_elements + html[insert_pos:]
    else:
        # No body tag, prepend to content
        html = running_elements + html

    return html


def generate_pdf_from_html(
    html: str,
    page_size: str = "A4",
    orientation: str = "portrait",
    margin_top: str = "2cm",
    margin_bottom: str = "2cm",
    margin_left: str = "2cm",
    margin_right: str = "2cm",
    include_page_numbers: bool = False,
    header_html: str | None = None,
    footer_html: str | None = None,
    header_height: str = "2cm",
    footer_height: str = "2cm",
    exclude_header_pages: str | None = None,
    exclude_footer_pages: str | None = None
) -> bytes:
    """
    Generates a PDF from an HTML string.

    Features:
    - Injects TailwindCSS and ensures basic HTML structure if missing
    - Page configuration via WeasyPrint stylesheets for priority
    - Custom header/footer support via running elements
    - Page number integration (standalone or in footer)
    - Page exclusion for headers/footers via post-processing

    Args:
        html: HTML content to convert
        page_size: Page size (A4, Letter, etc.)
        orientation: portrait or landscape
        margin_*: Page margins with units
        include_page_numbers: Add page numbers
        header_html: Custom HTML for page header
        footer_html: Custom HTML for page footer
        header_height: Height of header area
        footer_height: Height of footer area
        exclude_header_pages: Comma-separated page numbers to exclude header
        exclude_footer_pages: Comma-separated page numbers to exclude footer

    Returns:
        PDF file as bytes
    """
    # Basic check for HTML structure
    if "<html" not in html.lower():
        html = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PDF Document</title>
        </head>
        <body>
            {html}
        </body>
        </html>
        """

    # Inject TailwindCSS if not present
    if "cdn.tailwindcss.com" not in html:
        if "</head>" in html:
            html = html.replace("</head>", '<script src="https://cdn.tailwindcss.com"></script></head>')
        else:
            html = '<script src="https://cdn.tailwindcss.com"></script>' + html

    # Inject running elements for header/footer
    if header_html or footer_html:
        html = _inject_running_elements(html, header_html, footer_html, include_page_numbers)

    # Build page CSS
    page_css = _build_page_css(
        page_size=page_size,
        orientation=orientation,
        margin_top=margin_top,
        margin_bottom=margin_bottom,
        margin_left=margin_left,
        margin_right=margin_right,
        include_page_numbers=include_page_numbers,
        header_html=header_html,
        footer_html=footer_html,
        header_height=header_height,
        footer_height=footer_height
    )

    # Generate PDF
    if HTML is None:
        raise RuntimeError("WeasyPrint dependencies (GTK3) not found. Please run via Docker or install GTK3 on Windows.")

    # Apply page CSS as separate stylesheet to ensure it overrides user styles
    pdf_bytes = HTML(string=html).write_pdf(stylesheets=[CSS(string=page_css)])

    # Post-process for page exclusions if needed
    if (exclude_header_pages or exclude_footer_pages) and (header_html or footer_html):
        try:
            from .pdf_postprocess import apply_page_exclusions

            # Parse exclusion lists
            header_exclude_set = set()
            footer_exclude_set = set()

            if exclude_header_pages:
                header_exclude_set = {int(p.strip()) for p in exclude_header_pages.split(',')}
            if exclude_footer_pages:
                footer_exclude_set = {int(p.strip()) for p in exclude_footer_pages.split(',')}

            # Generate PDF without headers/footers for excluded pages
            page_css_no_hf = _build_page_css(
                page_size=page_size,
                orientation=orientation,
                margin_top=margin_top,
                margin_bottom=margin_bottom,
                margin_left=margin_left,
                margin_right=margin_right,
                include_page_numbers=False,
                header_html=None,
                footer_html=None,
                header_height=header_height,
                footer_height=footer_height
            )

            # Generate without running elements
            html_no_hf = html
            # Remove running element divs
            import re
            html_no_hf = re.sub(r'<div class="pdf-running-header"[^>]*>.*?</div>', '', html_no_hf, flags=re.DOTALL)
            html_no_hf = re.sub(r'<div class="pdf-running-footer"[^>]*>.*?</div>', '', html_no_hf, flags=re.DOTALL)
            html_no_hf = re.sub(r'<style>\s*\.page-num::before.*?</style>', '', html_no_hf, flags=re.DOTALL)

            pdf_bytes_no_hf = HTML(string=html_no_hf).write_pdf(stylesheets=[CSS(string=page_css_no_hf)])

            # Merge PDFs based on exclusions
            pdf_bytes = apply_page_exclusions(
                pdf_with_headers=pdf_bytes,
                pdf_without_headers=pdf_bytes_no_hf,
                exclude_header_pages=header_exclude_set,
                exclude_footer_pages=footer_exclude_set
            )
        except ImportError:
            # pikepdf not available, skip exclusions
            print("WARNING: pikepdf not installed. Page exclusions for headers/footers are not available.")

    return pdf_bytes
