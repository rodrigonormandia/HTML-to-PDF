"""
PDF Post-processing module for page-specific header/footer exclusions.

WeasyPrint's CSS @page rules don't support arbitrary page number targeting.
This module uses pikepdf to merge pages from two PDFs:
1. A PDF with headers/footers on all pages
2. A PDF without headers/footers

Pages are selected based on user-specified exclusion lists.
"""

import io
from typing import Set

try:
    import pikepdf
    PIKEPDF_AVAILABLE = True
except ImportError:
    PIKEPDF_AVAILABLE = False


def apply_page_exclusions(
    pdf_with_headers: bytes,
    pdf_without_headers: bytes,
    exclude_header_pages: Set[int],
    exclude_footer_pages: Set[int]
) -> bytes:
    """
    Merges two PDFs based on page exclusion rules.

    Strategy:
    - For pages in exclusion sets, use corresponding page from pdf_without_headers
    - For all other pages, use page from pdf_with_headers

    Note: This is a simplified approach. For independent header/footer exclusion,
    we'd need to generate 4 variants. Current implementation excludes both
    header AND footer for any page in either exclusion set.

    Args:
        pdf_with_headers: PDF bytes with headers/footers on all pages
        pdf_without_headers: PDF bytes without headers/footers
        exclude_header_pages: Set of 1-based page numbers to exclude header
        exclude_footer_pages: Set of 1-based page numbers to exclude footer

    Returns:
        Merged PDF bytes
    """
    if not PIKEPDF_AVAILABLE:
        raise ImportError("pikepdf is required for page exclusions")

    # Combine exclusion sets (simplified: exclude both h/f for any excluded page)
    exclude_pages = exclude_header_pages | exclude_footer_pages

    if not exclude_pages:
        return pdf_with_headers

    # Open both PDFs
    with_hf = pikepdf.open(io.BytesIO(pdf_with_headers))
    without_hf = pikepdf.open(io.BytesIO(pdf_without_headers))

    # Create output PDF
    output = pikepdf.new()

    # Get page counts
    num_pages_with = len(with_hf.pages)
    num_pages_without = len(without_hf.pages)

    # Use the minimum to avoid index errors if page counts differ slightly
    num_pages = min(num_pages_with, num_pages_without)

    # Merge pages based on exclusions
    for page_num in range(1, num_pages + 1):
        page_index = page_num - 1  # Convert to 0-based index

        if page_num in exclude_pages:
            # Use page from PDF without headers/footers
            output.pages.append(without_hf.pages[page_index])
        else:
            # Use page from PDF with headers/footers
            output.pages.append(with_hf.pages[page_index])

    # Write to bytes
    output_buffer = io.BytesIO()
    output.save(output_buffer)
    output_buffer.seek(0)

    return output_buffer.read()
