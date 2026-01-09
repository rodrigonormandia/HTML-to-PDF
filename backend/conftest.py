"""
Pytest configuration and fixtures for PDF Gravity backend tests.
"""
import sys
import os

# Ensure the parent directory is in the path for backend.* imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


# Storage for mocking Redis
_job_storage = {}
_pdf_storage = {}


def _mock_set_job_status(job_id, status, ttl=None):
    _job_storage[job_id] = status


def _mock_get_job_status(job_id):
    return _job_storage.get(job_id)


def _mock_store_pdf(job_id, pdf_bytes, ttl=None):
    _pdf_storage[job_id] = pdf_bytes


def _mock_get_pdf(job_id):
    return _pdf_storage.get(job_id)


@pytest.fixture(autouse=True)
def reset_storage():
    """Reset storage before each test."""
    _job_storage.clear()
    _pdf_storage.clear()
    yield


@pytest.fixture
def client():
    """Synchronous test client for FastAPI with mocked Redis and Celery."""
    from backend.pdf_service import generate_pdf_from_html

    def sync_task_delay(job_id, html, options):
        """Execute PDF generation synchronously for testing."""
        try:
            _mock_set_job_status(job_id, {"status": "processing"})
            pdf_bytes = generate_pdf_from_html(html=html, **options)
            _mock_store_pdf(job_id, pdf_bytes)
            _mock_set_job_status(job_id, {"status": "completed", "size": len(pdf_bytes)})
        except Exception as e:
            _mock_set_job_status(job_id, {"status": "failed", "error": str(e)})

    mock_task = MagicMock()
    mock_task.delay = MagicMock(side_effect=lambda **kwargs: sync_task_delay(**kwargs))

    with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
         patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
         patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
         patch('backend.main.generate_pdf_task', mock_task):

        from backend.main import app
        yield TestClient(app)


@pytest.fixture
def valid_html():
    """Valid HTML content for testing."""
    return "<html><body><h1>Test Document</h1><p>This is a test paragraph.</p></body></html>"


@pytest.fixture
def minimal_html():
    """Minimal valid HTML content (bare HTML without structure)."""
    return "<p>Hello World - This is minimal HTML content for testing.</p>"


@pytest.fixture
def complex_html():
    """Complex HTML with various elements for testing."""
    return """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Test Document</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .highlight { background-color: yellow; }
        </style>
    </head>
    <body>
        <h1>Complex Test Document</h1>
        <p class="highlight">This is a highlighted paragraph.</p>
        <table>
            <tr><th>Header 1</th><th>Header 2</th></tr>
            <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    </body>
    </html>
    """


@pytest.fixture
def malicious_html():
    """HTML with potentially dangerous content for sanitization testing."""
    return """
    <html>
    <body>
        <h1>Test</h1>
        <script>alert('XSS')</script>
        <p onclick="alert('click')">Click me</p>
        <a href="javascript:alert('link')">Malicious link</a>
        <img src="x" onerror="alert('img')">
        <iframe src="http://evil.com"></iframe>
    </body>
    </html>
    """
