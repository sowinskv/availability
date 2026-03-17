"""
Base exception classes for Our process tool.
"""


class ProcessToolException(Exception):
    """Base exception for all ProcessTool-specific errors."""

    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self):
        return {
            "error": self.__class__.__name__,
            "message": self.message,
            "details": self.details
        }
