"""
Project model for Our process tool.
"""
from sqlalchemy import Column, String, Text, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin


class ProjectType(enum.Enum):
    """Project type enumeration."""
    WEB_APP = "web_app"
    MOBILE_APP = "mobile_app"
    DESKTOP = "desktop"
    API = "api"
    OTHER = "other"


class ProjectStatus(enum.Enum):
    """Project status enumeration."""
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ProjectPriority(enum.Enum):
    """Project priority enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Project(Base, TimestampMixin):
    """Project model."""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    project_type = Column(Enum(ProjectType, values_callable=lambda x: [e.value for e in x]), nullable=True)
    description = Column(Text)
    client = Column(String(255))
    deadline = Column(Date)
    priority = Column(Enum(ProjectPriority), nullable=False, default=ProjectPriority.MEDIUM)
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.PLANNING, index=True)

    # Relationships
    requirements = relationship("Requirement", back_populates="project")

    def __repr__(self):
        return f"<Project {self.name} ({self.status.value})>"
