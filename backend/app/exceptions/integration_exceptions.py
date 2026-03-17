"""
Integration-specific exceptions for Our process tool.
"""
from .base import ProcessToolException


class IntegrationException(ProcessToolException):
    """Base class for integration errors."""
    pass


class OAuthTokenExpired(IntegrationException):
    """Raised when OAuth token has expired."""
    pass


class CalendarSyncError(IntegrationException):
    """Raised when calendar sync fails."""
    pass


class NotionSyncError(IntegrationException):
    """Raised when Notion sync fails."""
    pass


class AzureDevOpsSyncError(IntegrationException):
    """Raised when Azure DevOps sync fails."""
    pass


class IntegrationRateLimitError(IntegrationException):
    """Raised when integration API rate limit is exceeded."""
    pass
