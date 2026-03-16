"""
Skill models for Atlas.
"""
from sqlalchemy import Column, String, Enum, ForeignKey, Float, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin


class SkillCategory(enum.Enum):
    """Skill category enumeration."""
    LANGUAGE = "language"
    DOMAIN = "domain"
    TOOL = "tool"


class ProficiencyLevel(enum.Enum):
    """Proficiency level enumeration."""
    LEARNING = "learning"
    PROFICIENT = "proficient"
    EXPERT = "expert"


class Skill(Base, TimestampMixin):
    """Skill model."""
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True, index=True)
    category = Column(Enum(SkillCategory), nullable=False, index=True)

    # Relationships
    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Skill {self.name} ({self.category.value})>"


class UserSkill(Base, TimestampMixin):
    """User-skill association with proficiency."""
    __tablename__ = "user_skills"
    __table_args__ = (
        UniqueConstraint('user_id', 'skill_id', name='uq_user_skill'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    proficiency = Column(Enum(ProficiencyLevel), nullable=False, default=ProficiencyLevel.PROFICIENT)
    velocity_multiplier = Column(Float, nullable=False, default=1.0)

    # Relationships
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")

    def __repr__(self):
        return f"<UserSkill user={self.user_id} skill={self.skill_id} ({self.proficiency.value})>"


class TaskHistory(Base, TimestampMixin):
    """Historical task completion data for velocity tracking."""
    __tablename__ = "task_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    task_name = Column(String(255), nullable=False)
    estimated_hours = Column(Float, nullable=False)
    actual_hours = Column(Float, nullable=False)
    completed_at = Column(String)  # ISO date string

    # Relationships
    user = relationship("User", back_populates="task_history")

    def __repr__(self):
        return f"<TaskHistory {self.task_name} est={self.estimated_hours}h act={self.actual_hours}h>"
