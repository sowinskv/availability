"""
Allocation model for Atlas.
"""
from sqlalchemy import Column, Text, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin


class Allocation(Base, TimestampMixin):
    """Allocation model for task assignments."""
    __tablename__ = "allocations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    reason = Column(Text)  # Justification for allocation
    confidence_score = Column(Float, nullable=False, default=0.5)  # 0-1 confidence

    accepted_at = Column(DateTime)
    rejected_at = Column(DateTime)

    # Relationships
    task = relationship("Task", back_populates="allocations")
    user = relationship("User", back_populates="allocated_tasks")

    def __repr__(self):
        return f"<Allocation task={self.task_id} user={self.user_id} conf={self.confidence_score}>"


class VelocityModel(Base, TimestampMixin):
    """Cached velocity model for fast allocation."""
    __tablename__ = "velocity_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    avg_velocity_multiplier = Column(Float, nullable=False, default=1.0)
    confidence = Column(Float, nullable=False, default=0.0)  # 0-1, based on sample size
    last_updated = Column(DateTime)

    def __repr__(self):
        return f"<VelocityModel user={self.user_id} skill={self.skill_id} vel={self.avg_velocity_multiplier}>"
