try:
    from weasyprint import HTML, CSS
except OSError:
    HTML = None
    CSS = None
    print("WARNING: WeasyPrint dependencies not found. PDF generation will fail unless GTK3 is installed.")


def generate_pdf_from_html(
    html: str,
    page_size: str = "A4",
    orientation: str = "portrait",
    margin_top: str = "2cm",
    margin_bottom: str = "2cm",
    margin_left: str = "2cm",
    margin_right: str = "2cm",
    include_page_numbers: bool = False
) -> bytes:
    """
    Generates a PDF from an HTML string.
    Injects TailwindCSS and ensures basic HTML structure if missing.
    Page configuration is applied via WeasyPrint stylesheets parameter for priority.
    """

    # Generate @page CSS for customization (applied as separate stylesheet for priority)
    # Note: 'portrait' is the default, only 'landscape' needs to be specified
    size_value = f"{page_size} landscape" if orientation == "landscape" else page_size
    page_css = f"""
        @page {{
            size: {size_value} !important;
            margin-top: {margin_top} !important;
            margin-bottom: {margin_bottom} !important;
            margin-left: {margin_left} !important;
            margin-right: {margin_right} !important;
        }}
    """

    if include_page_numbers:
        page_css += """
        @page {
            @bottom-center {
                content: "Página " counter(page) " de " counter(pages);
                font-size: 10pt;
                color: #666;
            }
        }
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
        # Insert before </head>
        if "</head>" in html:
            html = html.replace("</head>", '<script src="https://cdn.tailwindcss.com"></script></head>')
        else:
            # If no head tag (shouldn't happen with wrapper above, but safe fallback), just prepend
            html = '<script src="https://cdn.tailwindcss.com"></script>' + html

    # Generate PDF
    if HTML is None:
        raise RuntimeError("WeasyPrint dependencies (GTK3) not found. Please run via Docker or install GTK3 on Windows.")

    # Apply page CSS as separate stylesheet to ensure it overrides user styles
    pdf_bytes = HTML(string=html).write_pdf(stylesheets=[CSS(string=page_css)])
    return pdf_bytes
