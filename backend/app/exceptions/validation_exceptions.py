"""
Validation-specific exceptions for Our process tool.
"""
from .base import ProcessToolException


class ValidationException(ProcessToolException):
    """Base class for validation errors."""
    pass


class InvalidTaskEstimateError(ValidationException):
    """Raised when task estimate is invalid."""
    pass


class InvalidRequirementError(ValidationException):
    """Raised when requirement data is invalid."""
    pass


class InvalidAvailabilityError(ValidationException):
    """Raised when availability data is invalid."""
    pass


class InvalidSkillError(ValidationException):
    """Raised when skill data is invalid."""
    pass
