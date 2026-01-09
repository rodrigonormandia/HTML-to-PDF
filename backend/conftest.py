"""
Pytest configuration and fixtures for PDF Leaf backend tests.
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
_rate_limit_storage = {}

# Test constants
TEST_USER_ID = "test-user-123"
TEST_API_KEY = "pk_test_valid_key_12345"
TEST_API_KEY_ID = "api-key-id-123"


# ============== Auth Mocks ==============

def _mock_validate_api_key_success(key_hash):
    """Mock successful API key validation."""
    return {
        "user_id": TEST_USER_ID,
        "plan": "free",
        "monthly_limit": 100,
        "api_key_id": TEST_API_KEY_ID,
        "is_valid": True
    }


def _mock_validate_api_key_invalid(key_hash):
    """Mock invalid API key validation."""
    return {"is_valid": False}


def _mock_check_user_quota_ok(user_id):
    """Mock quota check that allows conversion."""
    return {
        "can_convert": True,
        "used_this_month": 10,
        "monthly_limit": 100,
        "remaining": 90
    }


def _mock_check_user_quota_exceeded(user_id):
    """Mock quota check that denies conversion."""
    return {
        "can_convert": False,
        "used_this_month": 100,
        "monthly_limit": 100,
        "remaining": 0
    }


def _mock_track_conversion(*args, **kwargs):
    """Mock conversion tracking (no-op)."""
    return None


# ============== Rate Limiter Mocks ==============

def _mock_rate_limit_ok(api_key_id, plan):
    """Mock rate limit check that allows request."""
    return {
        "allowed": True,
        "limit": 10,
        "remaining": 9,
        "reset": 60
    }


def _mock_rate_limit_exceeded(api_key_id, plan):
    """Mock rate limit check that denies request."""
    return {
        "allowed": False,
        "limit": 10,
        "remaining": 0,
        "reset": 45
    }


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
    _rate_limit_storage.clear()
    yield


@pytest.fixture(autouse=True)
def disable_slowapi_limiter():
    """Disable slowapi IP-based rate limiter during tests."""
    with patch('backend.main.limiter.enabled', False):
        yield


def _create_mock_rate_limiter(check_func):
    """Create a mock rate limiter with the given check function."""
    mock_limiter = MagicMock()
    mock_limiter.check_rate_limit = MagicMock(side_effect=check_func)
    return mock_limiter


@pytest.fixture
def client():
    """
    Synchronous test client for FastAPI with mocked Redis, Celery, and Auth.
    This client bypasses authentication for testing core PDF functionality.
    Always returns a valid API key to bypass authentication checks.
    """
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
    mock_rate_limiter = _create_mock_rate_limiter(_mock_rate_limit_ok)

    with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
         patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
         patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
         patch('backend.main.generate_pdf_task', mock_task), \
         patch('backend.main.get_api_key_from_request', return_value=TEST_API_KEY), \
         patch('backend.main.validate_api_key', side_effect=_mock_validate_api_key_success), \
         patch('backend.main.check_user_quota', side_effect=_mock_check_user_quota_ok), \
         patch('backend.main.track_conversion', side_effect=_mock_track_conversion), \
         patch('backend.main.get_rate_limiter', return_value=mock_rate_limiter):

        from backend.main import app
        yield TestClient(app)


@pytest.fixture
def client_no_auth():
    """
    Test client WITHOUT auth - for testing authentication errors.
    Returns None for API key extraction, so requests fail with 401.
    """
    from backend.pdf_service import generate_pdf_from_html

    def sync_task_delay(job_id, html, options):
        try:
            _mock_set_job_status(job_id, {"status": "processing"})
            pdf_bytes = generate_pdf_from_html(html=html, **options)
            _mock_store_pdf(job_id, pdf_bytes)
            _mock_set_job_status(job_id, {"status": "completed", "size": len(pdf_bytes)})
        except Exception as e:
            _mock_set_job_status(job_id, {"status": "failed", "error": str(e)})

    mock_task = MagicMock()
    mock_task.delay = MagicMock(side_effect=lambda **kwargs: sync_task_delay(**kwargs))
    mock_rate_limiter = _create_mock_rate_limiter(_mock_rate_limit_ok)

    with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
         patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
         patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
         patch('backend.main.generate_pdf_task', mock_task), \
         patch('backend.main.get_api_key_from_request', return_value=None), \
         patch('backend.main.validate_api_key', side_effect=_mock_validate_api_key_invalid), \
         patch('backend.main.check_user_quota', side_effect=_mock_check_user_quota_ok), \
         patch('backend.main.track_conversion', side_effect=_mock_track_conversion), \
         patch('backend.main.get_rate_limiter', return_value=mock_rate_limiter):

        from backend.main import app
        yield TestClient(app)


@pytest.fixture
def client_quota_exceeded():
    """
    Test client with quota exceeded - for testing quota errors.
    Auth is valid, but quota check fails.
    """
    from backend.pdf_service import generate_pdf_from_html

    def sync_task_delay(job_id, html, options):
        try:
            _mock_set_job_status(job_id, {"status": "processing"})
            pdf_bytes = generate_pdf_from_html(html=html, **options)
            _mock_store_pdf(job_id, pdf_bytes)
            _mock_set_job_status(job_id, {"status": "completed", "size": len(pdf_bytes)})
        except Exception as e:
            _mock_set_job_status(job_id, {"status": "failed", "error": str(e)})

    mock_task = MagicMock()
    mock_task.delay = MagicMock(side_effect=lambda **kwargs: sync_task_delay(**kwargs))
    mock_rate_limiter = _create_mock_rate_limiter(_mock_rate_limit_ok)

    with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
         patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
         patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
         patch('backend.main.generate_pdf_task', mock_task), \
         patch('backend.main.get_api_key_from_request', return_value=TEST_API_KEY), \
         patch('backend.main.validate_api_key', side_effect=_mock_validate_api_key_success), \
         patch('backend.main.check_user_quota', side_effect=_mock_check_user_quota_exceeded), \
         patch('backend.main.track_conversion', side_effect=_mock_track_conversion), \
         patch('backend.main.get_rate_limiter', return_value=mock_rate_limiter):

        from backend.main import app
        yield TestClient(app)


@pytest.fixture
def client_rate_limited():
    """
    Test client with rate limit exceeded - for testing rate limit errors.
    Auth is valid, but rate limit check fails.
    """
    from backend.pdf_service import generate_pdf_from_html

    def sync_task_delay(job_id, html, options):
        try:
            _mock_set_job_status(job_id, {"status": "processing"})
            pdf_bytes = generate_pdf_from_html(html=html, **options)
            _mock_store_pdf(job_id, pdf_bytes)
            _mock_set_job_status(job_id, {"status": "completed", "size": len(pdf_bytes)})
        except Exception as e:
            _mock_set_job_status(job_id, {"status": "failed", "error": str(e)})

    mock_task = MagicMock()
    mock_task.delay = MagicMock(side_effect=lambda **kwargs: sync_task_delay(**kwargs))
    mock_rate_limiter = _create_mock_rate_limiter(_mock_rate_limit_exceeded)

    with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
         patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
         patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
         patch('backend.main.generate_pdf_task', mock_task), \
         patch('backend.main.get_api_key_from_request', return_value=TEST_API_KEY), \
         patch('backend.main.validate_api_key', side_effect=_mock_validate_api_key_success), \
         patch('backend.main.check_user_quota', side_effect=_mock_check_user_quota_ok), \
         patch('backend.main.track_conversion', side_effect=_mock_track_conversion), \
         patch('backend.main.get_rate_limiter', return_value=mock_rate_limiter):

        from backend.main import app
        yield TestClient(app)


@pytest.fixture
def client_invalid_api_key():
    """
    Test client with invalid API key - for testing invalid API key errors.
    API key is provided but validation fails.
    """
    from backend.pdf_service import generate_pdf_from_html

    def sync_task_delay(job_id, html, options):
        try:
            _mock_set_job_status(job_id, {"status": "processing"})
            pdf_bytes = generate_pdf_from_html(html=html, **options)
            _mock_store_pdf(job_id, pdf_bytes)
            _mock_set_job_status(job_id, {"status": "completed", "size": len(pdf_bytes)})
        except Exception as e:
            _mock_set_job_status(job_id, {"status": "failed", "error": str(e)})

    mock_task = MagicMock()
    mock_task.delay = MagicMock(side_effect=lambda **kwargs: sync_task_delay(**kwargs))
    mock_rate_limiter = _create_mock_rate_limiter(_mock_rate_limit_ok)

    with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
         patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
         patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
         patch('backend.main.generate_pdf_task', mock_task), \
         patch('backend.main.get_api_key_from_request', return_value="pk_invalid_key"), \
         patch('backend.main.validate_api_key', side_effect=_mock_validate_api_key_invalid), \
         patch('backend.main.check_user_quota', side_effect=_mock_check_user_quota_ok), \
         patch('backend.main.track_conversion', side_effect=_mock_track_conversion), \
         patch('backend.main.get_rate_limiter', return_value=mock_rate_limiter):

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
