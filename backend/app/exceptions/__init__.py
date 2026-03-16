"""
Exception classes for Atlas.
"""
from .base import AtlasException
from .llm_exceptions import (
    LLMException,
    MalformedResponseError,
    TokenLimitError,
    ContentPolicyError,
    LLMRateLimitError,
    LLMTimeoutError
)
from .integration_exceptions import (
    IntegrationException,
    OAuthTokenExpired,
    CalendarSyncError,
    NotionSyncError,
    AzureDevOpsSyncError,
    IntegrationRateLimitError
)
from .allocation_exceptions import (
    AllocationException,
    NoAvailableDeveloperError,
    CircularDependencyError,
    InsufficientCapacityError,
    SkillMismatchError
)
from .validation_exceptions import (
    ValidationException,
    InvalidTaskEstimateError,
    InvalidRequirementError,
    InvalidAvailabilityError,
    InvalidSkillError
)

__all__ = [
    "AtlasException",
    "LLMException",
    "MalformedResponseError",
    "TokenLimitError",
    "ContentPolicyError",
    "LLMRateLimitError",
    "LLMTimeoutError",
    "IntegrationException",
    "OAuthTokenExpired",
    "CalendarSyncError",
    "NotionSyncError",
    "AzureDevOpsSyncError",
    "IntegrationRateLimitError",
    "AllocationException",
    "NoAvailableDeveloperError",
    "CircularDependencyError",
    "InsufficientCapacityError",
    "SkillMismatchError",
    "ValidationException",
    "InvalidTaskEstimateError",
    "InvalidRequirementError",
    "InvalidAvailabilityError",
    "InvalidSkillError",
]
