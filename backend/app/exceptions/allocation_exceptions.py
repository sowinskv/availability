"""
Allocation-specific exceptions for Our process tool.
"""
from .base import ProcessToolException


class AllocationException(ProcessToolException):
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
