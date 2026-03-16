"""
Requirement model for Our process tool.
"""
from sqlalchemy import Column, String, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin


class RequirementStatus(enum.Enum):
    """Requirement status enumeration."""
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"


class RequirementSource(enum.Enum):
    """Requirement source enumeration."""
    VOICE = "voice"
    MANUAL = "manual"
    IMPORTED = "imported"


class Requirement(Base, TimestampMixin):
    """Requirement model for project requirements."""
    __tablename__ = "requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    status = Column(Enum(RequirementStatus), nullable=False, default=RequirementStatus.DRAFT, index=True)
    source = Column(Enum(RequirementSource), nullable=False, default=RequirementSource.MANUAL)

    # Structured requirements (JSON)
    functional_reqs = Column(JSONB, default=dict)
    non_functional_reqs = Column(JSONB, default=dict)
    technical_reqs = Column(JSONB, default=dict)

    # Voice input fields
    audio_url = Column(String(500))
    transcript = Column(Text)

    # Relationships
    author = relationship("User", back_populates="authored_requirements")
    tasks = relationship("Task", back_populates="requirement", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Requirement {self.title} ({self.status.value})>"
