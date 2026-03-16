"""
Security tests for secret scanning.
"""
import pytest
from backend.app.services.secret_scanning_service import SecretScanningService


@pytest.fixture
def scanner():
    return SecretScanningService()


def test_detect_api_key(scanner):
    """Test detection of API keys."""
    # Using a fake test key that won't trigger GitHub protection
    text = "API_KEY=test_key_1234567890abcdefghijklmnopqrstuvwxyz"
    findings = scanner.scan_text(text)

    assert len(findings) > 0
    assert findings[0]["type"] == "api_key"


def test_detect_aws_key(scanner):
    """Test detection of AWS access keys."""
    text = "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE"
    findings = scanner.scan_text(text)

    assert len(findings) > 0
    assert findings[0]["type"] == "aws_access_key"


def test_detect_password(scanner):
    """Test detection of passwords."""
    text = "password=SuperSecret123!"
    findings = scanner.scan_text(text)

    assert len(findings) > 0
    assert findings[0]["type"] == "password"


def test_detect_private_key(scanner):
    """Test detection of private keys."""
    text = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA..."
    findings = scanner.scan_text(text)

    assert len(findings) > 0
    assert findings[0]["type"] == "private_key"


def test_detect_jwt_token(scanner):
    """Test detection of JWT tokens."""
    text = "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
    findings = scanner.scan_text(text)

    assert len(findings) > 0
    assert findings[0]["type"] == "jwt_token"


def test_no_secrets_in_clean_text(scanner):
    """Test that clean text has no findings."""
    text = "This is a normal sentence with no secrets."
    findings = scanner.scan_text(text)

    assert len(findings) == 0
    assert not scanner.has_secrets(text)


def test_redaction(scanner):
    """Test that secrets are properly redacted."""
    text = "API_KEY=sk_live_very_long_secret_key_that_should_be_redacted_123456"
    findings = scanner.scan_text(text)

    assert len(findings) > 0
    assert "..." in findings[0]["value"]
    assert len(findings[0]["value"]) < len(text)
