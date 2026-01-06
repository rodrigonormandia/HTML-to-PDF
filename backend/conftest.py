"""
Pytest configuration and fixtures for PDF Gravity backend tests.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app


@pytest.fixture
def client():
    """Synchronous test client for FastAPI."""
    return TestClient(app)


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
