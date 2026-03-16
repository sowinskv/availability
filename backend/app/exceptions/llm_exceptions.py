"""
LLM-specific exceptions for Our process tool.
"""
from .base import Our process toolException


class LLMException(Our process toolException):
    """Base class for LLM-related errors."""
    pass


class MalformedResponseError(LLMException):
    """Raised when LLM returns unparseable or invalid response."""
    pass


class TokenLimitError(LLMException):
    """Raised when request exceeds token limits."""
    pass


class ContentPolicyError(LLMException):
    """Raised when content violates safety policies."""
    pass


class LLMRateLimitError(LLMException):
    """Raised when LLM API rate limit is exceeded."""
    pass


class LLMTimeoutError(LLMException):
    """Raised when LLM API request times out."""
    pass
