"""
PDF Leaf SDK Types
"""

from dataclasses import dataclass, field
from typing import List, Literal, Optional


PageSize = Literal["A4", "Letter", "A3", "A5", "Legal", "B4", "B5"]
Orientation = Literal["portrait", "landscape"]
JobStatusType = Literal["pending", "processing", "completed", "failed"]
WebhookEvent = Literal["job.completed", "job.failed"]


@dataclass
class PDFOptions:
    """
    PDF generation options.

    Attributes:
        page_size: Page size (default: 'A4')
        orientation: Page orientation (default: 'portrait')
        margin_top: Top margin with CSS units (default: '2cm')
        margin_bottom: Bottom margin with CSS units (default: '2cm')
        margin_left: Left margin with CSS units (default: '2cm')
        margin_right: Right margin with CSS units (default: '2cm')
        include_page_numbers: Include page numbers (default: False)
        header_html: Custom header HTML content
        footer_html: Custom footer HTML content
        header_height: Header height with CSS units (default: '2cm')
        footer_height: Footer height with CSS units (default: '2cm')
        exclude_header_pages: Comma-separated page numbers to exclude header
        exclude_footer_pages: Comma-separated page numbers to exclude footer
    """

    page_size: Optional[PageSize] = None
    orientation: Optional[Orientation] = None
    margin_top: Optional[str] = None
    margin_bottom: Optional[str] = None
    margin_left: Optional[str] = None
    margin_right: Optional[str] = None
    include_page_numbers: Optional[bool] = None
    header_html: Optional[str] = None
    footer_html: Optional[str] = None
    header_height: Optional[str] = None
    footer_height: Optional[str] = None
    exclude_header_pages: Optional[str] = None
    exclude_footer_pages: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to API request dictionary."""
        result = {}
        if self.page_size is not None:
            result["page_size"] = self.page_size
        if self.orientation is not None:
            result["orientation"] = self.orientation
        if self.margin_top is not None:
            result["margin_top"] = self.margin_top
        if self.margin_bottom is not None:
            result["margin_bottom"] = self.margin_bottom
        if self.margin_left is not None:
            result["margin_left"] = self.margin_left
        if self.margin_right is not None:
            result["margin_right"] = self.margin_right
        if self.include_page_numbers is not None:
            result["include_page_numbers"] = self.include_page_numbers
        if self.header_html is not None:
            result["header_html"] = self.header_html
        if self.footer_html is not None:
            result["footer_html"] = self.footer_html
        if self.header_height is not None:
            result["header_height"] = self.header_height
        if self.footer_height is not None:
            result["footer_height"] = self.footer_height
        if self.exclude_header_pages is not None:
            result["exclude_header_pages"] = self.exclude_header_pages
        if self.exclude_footer_pages is not None:
            result["exclude_footer_pages"] = self.exclude_footer_pages
        return result


@dataclass
class JobStatus:
    """
    Job status response.

    Attributes:
        status: Current job status
        size: PDF file size in bytes (when completed)
        error: Error message (when failed)
    """

    status: JobStatusType
    size: Optional[int] = None
    error: Optional[str] = None


@dataclass
class QuotaInfo:
    """Quota information."""

    used: int
    limit: int
    remaining: int


@dataclass
class RateLimitInfo:
    """Rate limit information."""

    limit: int
    remaining: int
    reset: int


@dataclass
class ConversionResponse:
    """
    Conversion response.

    Attributes:
        job_id: Unique job ID for tracking
        status: Initial status (always 'pending')
        quota: Quota information
        rate_limit: Rate limit information
    """

    job_id: str
    status: Literal["pending"]
    quota: Optional[QuotaInfo] = None
    rate_limit: Optional[RateLimitInfo] = None


@dataclass
class WebhookConfig:
    """
    Webhook configuration for creating a webhook.

    Attributes:
        url: Webhook endpoint URL (must be HTTPS)
        events: Events to subscribe to
    """

    url: str
    events: List[WebhookEvent] = field(default_factory=lambda: ["job.completed", "job.failed"])


@dataclass
class WebhookResponse:
    """
    Webhook response.

    Attributes:
        id: Webhook ID
        url: Webhook URL
        secret: Webhook secret for signature verification
        events: Subscribed events
        is_active: Whether the webhook is active
        created_at: Creation timestamp
    """

    id: str
    url: str
    secret: str
    events: List[WebhookEvent]
    is_active: bool
    created_at: str
