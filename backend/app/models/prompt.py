"""
Prompt model for managing LLM prompts.
"""
from sqlalchemy import Column, String, Text, Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from .base import Base, TimestampMixin


class Prompt(Base, TimestampMixin):
    """Prompt model for versioned LLM prompts."""
    __tablename__ = "prompts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    version = Column(Integer, nullable=False, default=1)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=False, index=True)
    eval_score = Column(Float)  # Evaluation score from test suite

    def __repr__(self):
        return f"<Prompt {self.name} v{self.version} {'[active]' if self.is_active else ''}>"
