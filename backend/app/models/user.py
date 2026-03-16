"""
User model for Atlas.
"""
from sqlalchemy import Column, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin


class UserRole(enum.Enum):
    """User role enumeration."""
    DEV = "dev"
    MANAGER = "manager"
    BA = "ba"
    CLIENT = "client"


class User(Base, TimestampMixin):
    """User model."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.DEV)

    # Azure AD / MSAL fields
    azure_ad_id = Column(String(255), unique=True, index=True)

    # Relationships
    availabilities = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    task_history = relationship("TaskHistory", back_populates="user", cascade="all, delete-orphan")
    allocated_tasks = relationship("Allocation", back_populates="user", cascade="all, delete-orphan")
    authored_requirements = relationship("Requirement", back_populates="author")

    def __repr__(self):
        return f"<User {self.name} ({self.email})>"
