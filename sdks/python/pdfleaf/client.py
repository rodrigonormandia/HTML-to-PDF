"""
PDF Leaf SDK Client

Official SDK for the PDF Leaf HTML-to-PDF conversion API.
"""

import hashlib
import hmac
import time
from typing import Any, Optional, Union

import httpx

from .exceptions import PDFLeafError
from .types import (
    ConversionResponse,
    JobStatus,
    PDFOptions,
    QuotaInfo,
    RateLimitInfo,
    WebhookConfig,
    WebhookResponse,
)

DEFAULT_BASE_URL = "https://htmltopdf.buscarid.com"
DEFAULT_TIMEOUT = 30.0
SDK_VERSION = "1.0.0"


class PDFLeaf:
    """
    PDF Leaf client for HTML to PDF conversion.

    Example:
        >>> client = PDFLeaf(api_key="pk_live_...")
        >>> pdf_bytes = client.convert("<h1>Hello World</h1>")

        >>> # With options
        >>> from pdfleaf import PDFOptions
        >>> pdf_bytes = client.convert(
        ...     "<h1>Report</h1>",
        ...     options=PDFOptions(page_size="Letter", orientation="landscape")
        ... )

        >>> # Async usage
        >>> async with PDFLeaf(api_key="pk_live_...") as client:
        ...     pdf_bytes = await client.convert_async("<h1>Hello</h1>")
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        """
        Create a new PDFLeaf client.

        Args:
            api_key: Your API key (starts with 'pk_')
            base_url: API base URL (default: https://htmltopdf.buscarid.com)
            timeout: Request timeout in seconds (default: 30)

        Raises:
            PDFLeafError: If API key is invalid
        """
        if not api_key:
            raise PDFLeafError("API key is required")

        if not api_key.startswith("pk_"):
            raise PDFLeafError('Invalid API key format. API keys should start with "pk_"')

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

        # Sync client (lazy initialized)
        self._sync_client: Optional[httpx.Client] = None
        # Async client (lazy initialized)
        self._async_client: Optional[httpx.AsyncClient] = None

    def _get_headers(self) -> dict[str, str]:
        """Get request headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-SDK-Version": SDK_VERSION,
            "X-SDK-Platform": "python",
        }

    def _get_sync_client(self) -> httpx.Client:
        """Get or create sync HTTP client."""
        if self._sync_client is None:
            self._sync_client = httpx.Client(
                base_url=self.base_url,
                headers=self._get_headers(),
                timeout=self.timeout,
            )
        return self._sync_client

    def _get_async_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self._async_client is None:
            self._async_client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=self._get_headers(),
                timeout=self.timeout,
            )
        return self._async_client

    def close(self) -> None:
        """Close the HTTP clients."""
        if self._sync_client is not None:
            self._sync_client.close()
            self._sync_client = None

    async def aclose(self) -> None:
        """Close the async HTTP client."""
        if self._async_client is not None:
            await self._async_client.aclose()
            self._async_client = None

    def __enter__(self) -> "PDFLeaf":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    async def __aenter__(self) -> "PDFLeaf":
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.aclose()

    def _handle_response(self, response: httpx.Response) -> dict[str, Any]:
        """Handle API response and raise errors if needed."""
        if response.status_code >= 400:
            try:
                data = response.json()
                message = data.get("detail", f"HTTP {response.status_code}")
            except Exception:
                data = {}
                message = f"HTTP {response.status_code}: {response.text}"

            raise PDFLeafError(message, response.status_code, data)

        return response.json()

    # ============== Sync Methods ==============

    def convert(
        self,
        html: str,
        options: Optional[Union[PDFOptions, dict[str, Any]]] = None,
    ) -> bytes:
        """
        Convert HTML to PDF (synchronous).

        This method submits a job and waits for completion.

        Args:
            html: HTML content to convert
            options: PDF generation options

        Returns:
            PDF file as bytes

        Example:
            >>> pdf = client.convert("<h1>Hello World</h1>")
            >>> with open("output.pdf", "wb") as f:
            ...     f.write(pdf)
        """
        job = self.submit(html, options)
        status = self.wait_for_completion(job.job_id)

        if status.status == "failed":
            raise PDFLeafError(status.error or "Conversion failed", 500)

        return self.download(job.job_id)

    def submit(
        self,
        html: str,
        options: Optional[Union[PDFOptions, dict[str, Any]]] = None,
    ) -> ConversionResponse:
        """
        Submit an HTML conversion job (synchronous).

        Args:
            html: HTML content to convert
            options: PDF generation options

        Returns:
            ConversionResponse with job_id
        """
        body: dict[str, Any] = {
            "html_content": html,
            "action": "download",
        }

        if options:
            if isinstance(options, PDFOptions):
                body.update(options.to_dict())
            else:
                body.update(options)

        response = self._get_sync_client().post("/api/v1/convert", json=body)
        data = self._handle_response(response)

        return ConversionResponse(
            job_id=data["job_id"],
            status=data["status"],
            quota=QuotaInfo(**data["quota"]) if data.get("quota") else None,
            rate_limit=RateLimitInfo(**data["rate_limit"]) if data.get("rate_limit") else None,
        )

    def get_status(self, job_id: str) -> JobStatus:
        """
        Get job status (synchronous).

        Args:
            job_id: The job ID

        Returns:
            Current job status
        """
        response = self._get_sync_client().get(f"/api/v1/jobs/{job_id}")
        data = self._handle_response(response)

        return JobStatus(
            status=data["status"],
            size=data.get("size"),
            error=data.get("error"),
        )

    def download(self, job_id: str) -> bytes:
        """
        Download PDF for a completed job (synchronous).

        Args:
            job_id: The job ID

        Returns:
            PDF file as bytes
        """
        response = self._get_sync_client().get(f"/api/v1/jobs/{job_id}/download")

        if response.status_code >= 400:
            raise PDFLeafError(f"HTTP {response.status_code}", response.status_code)

        return response.content

    def wait_for_completion(
        self,
        job_id: str,
        poll_interval: float = 0.5,
        max_wait: float = 60.0,
    ) -> JobStatus:
        """
        Wait for job completion (synchronous).

        Args:
            job_id: The job ID
            poll_interval: Polling interval in seconds (default: 0.5)
            max_wait: Maximum wait time in seconds (default: 60)

        Returns:
            Final job status

        Raises:
            PDFLeafError: If timeout is reached
        """
        start_time = time.time()

        while time.time() - start_time < max_wait:
            status = self.get_status(job_id)

            if status.status in ("completed", "failed"):
                return status

            time.sleep(poll_interval)

        raise PDFLeafError("Timeout waiting for job completion", 408)

    # ============== Async Methods ==============

    async def convert_async(
        self,
        html: str,
        options: Optional[Union[PDFOptions, dict[str, Any]]] = None,
    ) -> bytes:
        """
        Convert HTML to PDF (asynchronous).

        Args:
            html: HTML content to convert
            options: PDF generation options

        Returns:
            PDF file as bytes
        """
        job = await self.submit_async(html, options)
        status = await self.wait_for_completion_async(job.job_id)

        if status.status == "failed":
            raise PDFLeafError(status.error or "Conversion failed", 500)

        return await self.download_async(job.job_id)

    async def submit_async(
        self,
        html: str,
        options: Optional[Union[PDFOptions, dict[str, Any]]] = None,
    ) -> ConversionResponse:
        """
        Submit an HTML conversion job (asynchronous).

        Args:
            html: HTML content to convert
            options: PDF generation options

        Returns:
            ConversionResponse with job_id
        """
        body: dict[str, Any] = {
            "html_content": html,
            "action": "download",
        }

        if options:
            if isinstance(options, PDFOptions):
                body.update(options.to_dict())
            else:
                body.update(options)

        response = await self._get_async_client().post("/api/v1/convert", json=body)
        data = self._handle_response(response)

        return ConversionResponse(
            job_id=data["job_id"],
            status=data["status"],
            quota=QuotaInfo(**data["quota"]) if data.get("quota") else None,
            rate_limit=RateLimitInfo(**data["rate_limit"]) if data.get("rate_limit") else None,
        )

    async def get_status_async(self, job_id: str) -> JobStatus:
        """
        Get job status (asynchronous).

        Args:
            job_id: The job ID

        Returns:
            Current job status
        """
        response = await self._get_async_client().get(f"/api/v1/jobs/{job_id}")
        data = self._handle_response(response)

        return JobStatus(
            status=data["status"],
            size=data.get("size"),
            error=data.get("error"),
        )

    async def download_async(self, job_id: str) -> bytes:
        """
        Download PDF for a completed job (asynchronous).

        Args:
            job_id: The job ID

        Returns:
            PDF file as bytes
        """
        response = await self._get_async_client().get(f"/api/v1/jobs/{job_id}/download")

        if response.status_code >= 400:
            raise PDFLeafError(f"HTTP {response.status_code}", response.status_code)

        return response.content

    async def wait_for_completion_async(
        self,
        job_id: str,
        poll_interval: float = 0.5,
        max_wait: float = 60.0,
    ) -> JobStatus:
        """
        Wait for job completion (asynchronous).

        Args:
            job_id: The job ID
            poll_interval: Polling interval in seconds (default: 0.5)
            max_wait: Maximum wait time in seconds (default: 60)

        Returns:
            Final job status
        """
        import asyncio

        start_time = time.time()

        while time.time() - start_time < max_wait:
            status = await self.get_status_async(job_id)

            if status.status in ("completed", "failed"):
                return status

            await asyncio.sleep(poll_interval)

        raise PDFLeafError("Timeout waiting for job completion", 408)

    # ============== Webhook Methods ==============

    def create_webhook(self, config: Union[WebhookConfig, dict[str, Any]]) -> WebhookResponse:
        """
        Create a webhook (synchronous).

        Args:
            config: Webhook configuration

        Returns:
            Created webhook with secret
        """
        if isinstance(config, WebhookConfig):
            body = {"url": config.url, "events": config.events}
        else:
            body = config

        response = self._get_sync_client().post("/api/v1/webhooks", json=body)
        data = self._handle_response(response)

        return WebhookResponse(
            id=data["id"],
            url=data["url"],
            secret=data["secret"],
            events=data["events"],
            is_active=data["is_active"],
            created_at=data["created_at"],
        )

    def list_webhooks(self) -> list[WebhookResponse]:
        """
        List all webhooks (synchronous).

        Returns:
            List of webhook configurations
        """
        response = self._get_sync_client().get("/api/v1/webhooks")
        data = self._handle_response(response)

        return [
            WebhookResponse(
                id=wh["id"],
                url=wh["url"],
                secret=wh["secret"],
                events=wh["events"],
                is_active=wh["is_active"],
                created_at=wh["created_at"],
            )
            for wh in data
        ]

    def delete_webhook(self, webhook_id: str) -> None:
        """
        Delete a webhook (synchronous).

        Args:
            webhook_id: The webhook ID to delete
        """
        response = self._get_sync_client().delete(f"/api/v1/webhooks/{webhook_id}")
        self._handle_response(response)

    async def create_webhook_async(
        self, config: Union[WebhookConfig, dict[str, Any]]
    ) -> WebhookResponse:
        """Create a webhook (asynchronous)."""
        if isinstance(config, WebhookConfig):
            body = {"url": config.url, "events": config.events}
        else:
            body = config

        response = await self._get_async_client().post("/api/v1/webhooks", json=body)
        data = self._handle_response(response)

        return WebhookResponse(
            id=data["id"],
            url=data["url"],
            secret=data["secret"],
            events=data["events"],
            is_active=data["is_active"],
            created_at=data["created_at"],
        )

    async def list_webhooks_async(self) -> list[WebhookResponse]:
        """List all webhooks (asynchronous)."""
        response = await self._get_async_client().get("/api/v1/webhooks")
        data = self._handle_response(response)

        return [
            WebhookResponse(
                id=wh["id"],
                url=wh["url"],
                secret=wh["secret"],
                events=wh["events"],
                is_active=wh["is_active"],
                created_at=wh["created_at"],
            )
            for wh in data
        ]

    async def delete_webhook_async(self, webhook_id: str) -> None:
        """Delete a webhook (asynchronous)."""
        response = await self._get_async_client().delete(f"/api/v1/webhooks/{webhook_id}")
        self._handle_response(response)

    # ============== Static Methods ==============

    @staticmethod
    def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
        """
        Verify a webhook signature.

        Args:
            payload: The raw request body as a string
            signature: The X-PDFLeaf-Signature header value
            secret: Your webhook secret

        Returns:
            True if the signature is valid

        Example:
            >>> # Flask example
            >>> @app.route('/webhooks/pdfleaf', methods=['POST'])
            >>> def handle_webhook():
            ...     signature = request.headers.get('X-PDFLeaf-Signature', '')
            ...     is_valid = PDFLeaf.verify_webhook_signature(
            ...         request.data.decode(),
            ...         signature,
            ...         'your-webhook-secret'
            ...     )
            ...     if not is_valid:
            ...         return 'Invalid signature', 401
            ...     # Process webhook...
            ...     return 'OK', 200
        """
        if not signature.startswith("sha256="):
            return False

        provided_signature = signature[7:]

        expected_signature = hmac.new(
            secret.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(provided_signature, expected_signature)
