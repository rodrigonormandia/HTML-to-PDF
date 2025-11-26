try:
    from weasyprint import HTML
except OSError:
    HTML = None
    print("WARNING: WeasyPrint dependencies not found. PDF generation will fail unless GTK3 is installed.")


def generate_pdf_from_html(html: str) -> bytes:
    """
    Generates a PDF from an HTML string.
    Injects TailwindCSS and ensures basic HTML structure if missing.
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
        
    pdf_bytes = HTML(string=html).write_pdf()
    return pdf_bytes
