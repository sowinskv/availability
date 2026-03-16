"""
Task model for Atlas.
"""
from sqlalchemy import Column, String, Text, Enum, ForeignKey, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin


class TaskStatus(enum.Enum):
    """Task status enumeration."""
    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"


class TaskPriority(enum.Enum):
    """Task priority enumeration."""
    P0 = "p0"
    P1 = "p1"
    P2 = "p2"
    P3 = "p3"


class Task(Base, TimestampMixin):
    """Task model for project tasks."""
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(500), nullable=False)
    description = Column(Text)
    acceptance_criteria = Column(Text)

    estimated_hours = Column(Float)
    actual_hours = Column(Float)

    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.BACKLOG, index=True)
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.P2, index=True)

    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    # Dependencies (array of task IDs)
    dependencies = Column(ARRAY(UUID(as_uuid=True)), default=list)

    # Required skills (array of skill IDs)
    required_skills = Column(ARRAY(UUID(as_uuid=True)), default=list)

    # Version for optimistic locking
    version = Column(Integer, nullable=False, default=1)

    # Relationships
    requirement = relationship("Requirement", back_populates="tasks")
    allocations = relationship("Allocation", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Task {self.title} ({self.status.value})>"
