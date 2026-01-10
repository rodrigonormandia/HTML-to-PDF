"""
PDF Leaf SDK for Python

Official SDK for the PDF Leaf HTML-to-PDF conversion API.

Example:
    >>> from pdfleaf import PDFLeaf
    >>> client = PDFLeaf(api_key="pk_live_...")
    >>> pdf_bytes = client.convert("<h1>Hello World</h1>")
"""

from .client import PDFLeaf
from .types import PDFOptions, JobStatus, ConversionResponse, WebhookConfig, WebhookResponse
from .exceptions import PDFLeafError

__version__ = "1.0.0"
__all__ = [
    "PDFLeaf",
    "PDFOptions",
    "JobStatus",
    "ConversionResponse",
    "WebhookConfig",
    "WebhookResponse",
    "PDFLeafError",
]
