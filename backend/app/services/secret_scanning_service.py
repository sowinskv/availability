"""
Secret scanning service for security.
"""
import re
from typing import List, Dict


class SecretScanningService:
    """Service for detecting secrets in text."""

    # Regex patterns for common secrets
    PATTERNS = {
        "api_key": r"(?i)(api[_-]?key|apikey)['\"]?\s*[:=]\s*['\"]?([a-zA-Z0-9_\-]{20,})",
        "aws_access_key": r"AKIA[0-9A-Z]{16}",
        "password": r"(?i)(password|passwd|pwd)['\"]?\s*[:=]\s*['\"]?([^\s'\"]{8,})",
        "private_key": r"-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----",
        "jwt_token": r"eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+",
        "github_token": r"ghp_[a-zA-Z0-9]{36}",
        "slack_token": r"xox[baprs]-[0-9]{10,12}-[0-9]{10,12}-[a-zA-Z0-9]{24,}",
        "azure_key": r"(?i)azure[_-]?key['\"]?\s*[:=]\s*['\"]?([a-zA-Z0-9+/]{88}==)",
    }

    def scan_text(self, text: str) -> List[Dict[str, str]]:
        """
        Scan text for potential secrets.

        Args:
            text: Text to scan

        Returns:
            List of detected secrets with type and redacted value
        """
        findings = []

        for secret_type, pattern in self.PATTERNS.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                # Redact the secret
                secret_value = match.group(0)
                redacted_value = secret_value[:8] + "..." + secret_value[-4:] if len(secret_value) > 12 else "***"

                findings.append({
                    "type": secret_type,
                    "value": redacted_value,
                    "position": match.start(),
                    "length": len(secret_value)
                })

        return findings

    def has_secrets(self, text: str) -> bool:
        """Check if text contains any secrets."""
        return len(self.scan_text(text)) > 0
