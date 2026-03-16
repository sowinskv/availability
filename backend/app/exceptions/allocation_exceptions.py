"""
Allocation-specific exceptions for Our process tool.
"""
from .base import Our process toolException


class AllocationException(Our process toolException):
    """Base class for allocation errors."""
    pass


class NoAvailableDeveloperError(AllocationException):
    """Raised when no developers are available for allocation."""
    pass


class CircularDependencyError(AllocationException):
    """Raised when task dependencies form a cycle."""
    pass


class InsufficientCapacityError(AllocationException):
    """Raised when team doesn't have enough capacity for tasks."""
    pass


class SkillMismatchError(AllocationException):
    """Raised when no developers have required skills."""
    pass
