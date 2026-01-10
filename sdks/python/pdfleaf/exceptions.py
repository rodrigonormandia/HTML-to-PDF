"""
PDF Leaf SDK Exceptions
"""

from typing import Any, Optional


class PDFLeafError(Exception):
    """
    Exception raised for PDF Leaf API errors.

    Attributes:
        message: Human-readable error message
        status: HTTP status code (0 if not an HTTP error)
        data: Additional error data from the API
    """

    def __init__(
        self,
        message: str,
        status: int = 0,
        data: Optional[dict[str, Any]] = None
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status = status
        self.data = data or {}

    def __str__(self) -> str:
        if self.status:
            return f"PDFLeafError ({self.status}): {self.message}"
        return f"PDFLeafError: {self.message}"

    def __repr__(self) -> str:
        return f"PDFLeafError(message={self.message!r}, status={self.status}, data={self.data!r})"
