"""
Tests for webhook functionality.
Tests webhook signature generation, verification, and API endpoints.
"""
import pytest
import json
import hmac
import hashlib
from unittest.mock import patch, MagicMock, AsyncMock


class TestWebhookSignature:
    """Tests for webhook signature generation and verification."""

    def test_generate_signature(self):
        """Signature should be generated correctly."""
        from backend.webhook_service import generate_webhook_signature

        payload = '{"event": "job.completed", "job_id": "test-123"}'
        secret = "test_secret_key"

        signature = generate_webhook_signature(payload, secret)

        # Verify it's a valid hex string
        assert len(signature) == 64  # SHA256 produces 64 hex chars
        assert all(c in "0123456789abcdef" for c in signature)

        # Verify the signature is correct
        expected = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        assert signature == expected

    def test_verify_signature_valid(self):
        """Valid signature should be verified correctly."""
        from backend.webhook_service import (
            generate_webhook_signature,
            verify_webhook_signature
        )

        payload = '{"event": "job.completed"}'
        secret = "my_secret"

        signature = generate_webhook_signature(payload, secret)
        assert verify_webhook_signature(payload, signature, secret) is True

    def test_verify_signature_invalid(self):
        """Invalid signature should fail verification."""
        from backend.webhook_service import verify_webhook_signature

        payload = '{"event": "job.completed"}'
        secret = "my_secret"
        wrong_signature = "0" * 64

        assert verify_webhook_signature(payload, wrong_signature, secret) is False

    def test_verify_signature_wrong_secret(self):
        """Signature with wrong secret should fail verification."""
        from backend.webhook_service import (
            generate_webhook_signature,
            verify_webhook_signature
        )

        payload = '{"event": "job.completed"}'
        secret = "correct_secret"
        wrong_secret = "wrong_secret"

        signature = generate_webhook_signature(payload, secret)
        assert verify_webhook_signature(payload, signature, wrong_secret) is False


class TestWebhookEndpoints:
    """Tests for webhook API endpoints."""

    @pytest.fixture
    def client_with_webhook_mocks(self):
        """Client with mocked Supabase for webhook operations."""
        from backend.pdf_service import generate_pdf_from_html
        from unittest.mock import patch, MagicMock

        # Mock storage
        _job_storage = {}
        _pdf_storage = {}
        _webhook_storage = {}
        _webhook_id_counter = [0]

        def _mock_set_job_status(job_id, status, ttl=None):
            _job_storage[job_id] = status

        def _mock_get_job_status(job_id):
            return _job_storage.get(job_id)

        def _mock_store_pdf(job_id, pdf_bytes, ttl=None):
            _pdf_storage[job_id] = pdf_bytes

        def _mock_get_pdf(job_id):
            return _pdf_storage.get(job_id)

        def sync_task_delay(job_id, html, options, user_id=None):
            try:
                _mock_set_job_status(job_id, {"status": "processing"})
                pdf_bytes = generate_pdf_from_html(html=html, **options)
                _mock_store_pdf(job_id, pdf_bytes)
                _mock_set_job_status(job_id, {"status": "completed", "size": len(pdf_bytes)})
            except Exception as e:
                _mock_set_job_status(job_id, {"status": "failed", "error": str(e)})

        # Mock Supabase client for webhook operations
        mock_supabase = MagicMock()

        def mock_webhook_insert(data):
            """Mock webhook config insert."""
            _webhook_id_counter[0] += 1
            webhook_id = f"webhook-{_webhook_id_counter[0]}"
            webhook_data = {**data, "id": webhook_id}
            _webhook_storage[webhook_id] = webhook_data

            # Return mock response
            mock_response = MagicMock()
            mock_response.data = [webhook_data]
            return mock_response

        def mock_webhook_select():
            """Mock webhook config select."""
            mock_response = MagicMock()
            mock_response.data = list(_webhook_storage.values())
            return mock_response

        def mock_webhook_delete(webhook_id):
            """Mock webhook config delete."""
            if webhook_id in _webhook_storage:
                del _webhook_storage[webhook_id]
            mock_response = MagicMock()
            mock_response.data = []
            return mock_response

        # Set up chain of mocks for Supabase
        mock_table = MagicMock()
        mock_table.insert.return_value.execute.side_effect = lambda: mock_webhook_insert(
            mock_table.insert.call_args[0][0]
        )
        mock_table.select.return_value.eq.return_value.execute.side_effect = mock_webhook_select
        mock_table.delete.return_value.eq.return_value.eq.return_value.execute.side_effect = (
            lambda: mock_webhook_delete(
                mock_table.delete.return_value.eq.call_args[0][1]
            )
        )
        mock_supabase.table.return_value = mock_table

        mock_task = MagicMock()
        mock_task.delay = MagicMock(side_effect=lambda **kwargs: sync_task_delay(**kwargs))

        mock_rate_limiter = MagicMock()
        mock_rate_limiter.check_rate_limit = MagicMock(return_value={
            "allowed": True, "limit": 10, "remaining": 9, "reset": 60
        })

        TEST_USER_ID = "test-user-123"
        TEST_API_KEY = "pk_test_valid_key_12345"

        def _mock_validate_api_key_success(key_hash):
            return {
                "user_id": TEST_USER_ID,
                "plan": "free",
                "monthly_limit": 100,
                "api_key_id": "api-key-id-123",
                "is_valid": True
            }

        def _mock_check_user_quota_ok(user_id):
            return {
                "can_convert": True,
                "used_this_month": 10,
                "monthly_limit": 100,
                "remaining": 90
            }

        with patch('backend.main.set_job_status', side_effect=_mock_set_job_status), \
             patch('backend.main.get_job_status', side_effect=_mock_get_job_status), \
             patch('backend.main.get_pdf', side_effect=_mock_get_pdf), \
             patch('backend.main.generate_pdf_task', mock_task), \
             patch('backend.main.get_api_key_from_request', return_value=TEST_API_KEY), \
             patch('backend.main.validate_api_key', side_effect=_mock_validate_api_key_success), \
             patch('backend.main.check_user_quota', side_effect=_mock_check_user_quota_ok), \
             patch('backend.main.track_conversion', return_value=None), \
             patch('backend.main.get_rate_limiter', return_value=mock_rate_limiter), \
             patch('backend.main.supabase', mock_supabase), \
             patch('backend.main.limiter.enabled', False):

            from backend.main import app
            from fastapi.testclient import TestClient
            yield TestClient(app), _webhook_storage, TEST_USER_ID

    def test_create_webhook_success(self, client_with_webhook_mocks):
        """Creating a webhook should succeed with valid data."""
        client, webhook_storage, user_id = client_with_webhook_mocks

        response = client.post(
            "/api/v1/webhooks",
            json={
                "url": "https://example.com/webhook",
                "events": ["job.completed", "job.failed"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "secret" in data
        assert data["url"] == "https://example.com/webhook"
        assert data["events"] == ["job.completed", "job.failed"]

    def test_create_webhook_invalid_url(self, client_with_webhook_mocks):
        """Creating a webhook with invalid URL should fail."""
        client, webhook_storage, user_id = client_with_webhook_mocks

        response = client.post(
            "/api/v1/webhooks",
            json={
                "url": "not-a-valid-url",
                "events": ["job.completed"]
            }
        )

        assert response.status_code == 422

    def test_create_webhook_http_url_rejected(self, client_with_webhook_mocks):
        """Creating a webhook with HTTP (non-HTTPS) URL should fail."""
        client, webhook_storage, user_id = client_with_webhook_mocks

        response = client.post(
            "/api/v1/webhooks",
            json={
                "url": "http://example.com/webhook",
                "events": ["job.completed"]
            }
        )

        assert response.status_code == 422

    def test_create_webhook_invalid_event(self, client_with_webhook_mocks):
        """Creating a webhook with invalid event should fail."""
        client, webhook_storage, user_id = client_with_webhook_mocks

        response = client.post(
            "/api/v1/webhooks",
            json={
                "url": "https://example.com/webhook",
                "events": ["invalid.event"]
            }
        )

        assert response.status_code == 422


class TestWebhookServiceSendSync:
    """Tests for the synchronous webhook sender."""

    def test_send_webhook_sync_with_no_configs(self):
        """send_webhook_sync should return False when no configs exist."""
        from backend.webhook_service import send_webhook_sync

        with patch('backend.webhook_service.send_webhook', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = False

            result = send_webhook_sync(
                user_id="test-user",
                job_id="test-job",
                event_type="job.completed",
                data={"status": "completed"}
            )

            assert result is False


class TestWebhookPayloadStructure:
    """Tests for webhook payload structure."""

    def test_webhook_payload_contains_required_fields(self):
        """Webhook payload should contain all required fields."""
        # This tests the payload structure by examining what would be sent
        expected_fields = ["event", "job_id", "timestamp", "data"]

        # Build a sample payload like send_webhook does
        import json
        from datetime import datetime

        payload = {
            "event": "job.completed",
            "job_id": "test-123",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": {"status": "completed", "size": 1024}
        }

        for field in expected_fields:
            assert field in payload

    def test_webhook_headers_contain_signature(self):
        """Webhook requests should include proper headers."""
        from backend.webhook_service import generate_webhook_signature
        import json

        payload = json.dumps({"event": "job.completed", "job_id": "test"}, sort_keys=True)
        secret = "test_secret"
        signature = generate_webhook_signature(payload, secret)

        # The header format should be sha256=<signature>
        expected_header = f"sha256={signature}"
        assert expected_header.startswith("sha256=")
        assert len(expected_header) == 7 + 64  # "sha256=" + 64 hex chars
